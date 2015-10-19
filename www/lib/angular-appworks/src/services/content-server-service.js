function contentServerService($appworks) {
    var self = this;

    self.items = {};
    self.store = $appworks.cache;

    function clear() {
        self.items = {};
        self.store.removeObj('$contentServer.items');
    }

    function addItem(item, callback, err) {
        // TODO make $http call to add item
        item.id = Math.ceil(Math.random() * 10000);

        self.items[item.parent] = self.items[item.parent] || [];
        self.items[item.parent].push(item);

        save();
        return callback(item);
    }

    function getRootItems(id, callback, refresh) {
        var collection;
        if (refresh) {
            collection = mock(id);
            // cache items for later retrieval
            save(id, collection);
        } else {
            // check for items in cache, return deserialized collection from cache
            // if collection with that parent key does not exist, recursively call this method with refresh enabled
            collection = getRootItemsFromCache(id);
            if (!collection) {
                return getRootItems(id, callback, true);
            }
        }
        // return all items with parent === id
        return callback(collection);
    }

    function getRootItemsFromCache(id) {
        var items = self.store.getObj('$contentServer.items');
        if (items) {
            self.items[id] = items[id];
            return angular.copy(items[id]);
        }
    }

    function save(id, collection) {
        if (id !== undefined) {
            self.items[id] = angular.copy(collection);
        }
        storeItemsInCache();
    }

    function storeItemsInCache() {
        self.store.setObj('$contentServer.items', self.items);
    }

    function collectItemsByParent(items, parentId) {
        var collection = [];
        for (var item in items) {
            if (items[item].parent == parentId) {
                collection.push(items[item]);
            }
        }
        return collection;
    }

    function mock(id) {
        var fakeItem1 = {
                id: 1,
                name: 'Fake Item 1',
                description: 'A mocked out item',
                parent: 3,
                type: 0,
                children: []
            },
            fakeItem2 = {
                id: 2,
                name: 'Fake Item 2',
                description: 'Another mocked out item',
                parent: 3,
                type: 0,
                children: []
            },
            fakeItem3 = {
                id: 3,
                name: 'Fake Item 3',
                description: 'Yet another mocked out item',
                parent: null,
                type: 0,
                children: [fakeItem2, fakeItem1]
            },
            fakeItem4 = {
                id: 4,
                name: 'Fake Item 4',
                description: 'Yet another mocked out item',
                parent: null,
                type: 0,
                children: []
            },
            fakeItem5 = {
                id: 5,
                name: 'Fake Item 5',
                description: 'Yet another mocked out item',
                type: 1,
                parent: 4,
                children: []
            },
            fakeItem6 = {
                id: 6,
                name: 'Fake Item 6',
                description: 'Yet another mocked out item',
                type: 1,
                parent: null,
                children: []
            };


        var fakeItems = [fakeItem1, fakeItem2, fakeItem3, fakeItem4, fakeItem5, fakeItem6];
        return collectItemsByParent(fakeItems, id);

    }

    return {
        rootItems: getRootItems,
        addItem: addItem,
        save: save,
        clear: clear
    };
}