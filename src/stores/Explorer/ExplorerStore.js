import {flow, isAlive, types} from "mobx-state-tree";
import getLogger from "../../tools/getLogger";
import getExplorerModules from "../../tools/getExplorerModules";
import ExplorerModuleStore from "./ExplorerModuleStore";
import ExplorerSectionStore from "./ExplorerSectionStore";
import _isEqual from "lodash.isequal";

const promiseLimit = require('promise-limit');

const logger = getLogger('ExplorerStore');
const limitOne = promiseLimit(1);

/**
 * @typedef {{}} ExplorerStore
 * @property {string} [state]
 * @property {ExplorerSectionStore[]} sections
 * @property {Map<*,ExplorerModuleStore>|undefined} modules
 * @property {function} setSections
 * @property {function} setState
 * @property {function:Promise} fetch
 * @property {function} saveSections
 * @property {function} moveSection
 */
const ExplorerStore = types.model('ExplorerStore', {
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  sections: types.array(ExplorerSectionStore),
  modules: types.maybe(types.map(ExplorerModuleStore)),
}).actions(/**ExplorerStore*/self => {
  return {
    setSections(sections) {
      self.sections = sections;
    },
    setState(value) {
      self.state = value;
    },
    fetch: flow(function* () {
      self.state = 'pending';
      try {
        const [modules, sections] = yield Promise.all([
          fetchModules(),
          fetchSections()
        ]);
        if (isAlive(self)) {
          self.sections = sections;
          self.modules = modules;
          self.state = 'done';
        }
      } catch (err) {
        logger.error('fetch error', err);
        if (isAlive(self)) {
          self.state = 'error';
        }
      }
    }),
  };
}).views(self => {
  const storageChangeListener = (changes, namespace) => {
    if (self.state !== 'done') return;

    if (namespace === 'sync') {
      const change = changes.explorerSections;
      if (change) {
        const explorerSections = change.newValue || [];
        if (!_isEqual(explorerSections, self.getSectionsSnapshot())) {
          self.setSections([]);
          self.setSections(explorerSections);
        }
      }
    }
  };

  return {
    getSectionsSnapshot() {
      return self.sections.map(section => section.getSnapshot());
    },
    saveSections() {
      return limitOne(() => {
        const sections = self.getSectionsSnapshot();
        return new Promise(resolve => chrome.storage.sync.set({explorerSections: sections}, resolve));
      });
    },
    moveSection(index, prevIndex, nextIndex) {
      const sections = self.sections.slice(0);
      const item = sections[index];
      const prevItem = sections[prevIndex];
      const nextItem = sections[nextIndex];

      sections.splice(index, 1);

      if (prevItem) {
        const pos = sections.indexOf(prevItem);
        if (pos !== -1) {
          sections.splice(pos + 1, 0, item);
        }
      } else
      if (nextItem) {
        const pos = sections.indexOf(nextItem);
        if (pos !== -1) {
          sections.splice(pos, 0, item);
        }
      } else {
        sections.push(item);
      }

      self.setSections(sections);
      return self.saveSections();
    },
    afterCreate() {
      chrome.storage.onChanged.addListener(storageChangeListener);
    },
    beforeDestroy() {
      chrome.storage.onChanged.removeListener(storageChangeListener);
    },
  };
});

const fetchModules = async () => {
  return await getExplorerModules();
};

const fetchSections = async () => {
  const storage = await new Promise(resolve => chrome.storage.sync.get({
    explorerSections: [{
      id: 'favorite'
    }, {
      id: 'kpFavorites'
    }, {
      id: 'kpInCinema'
    }, {
      id: 'imdbInCinema'
    }, {
      id: 'kpPopular'
    }, {
      id: 'imdbPopular'
    }, {
      id: 'kpSeries'
    }, {
      id: 'imdbSeries'
    }, {
      id: 'ggGamesNew'
    }, {
      id: 'ggGamesTop'
    }]
  }, resolve));
  return storage.explorerSections;
};

export default ExplorerStore;
export {ExplorerModuleStore};