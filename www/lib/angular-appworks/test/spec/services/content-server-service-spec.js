describe('contentServerService', function () {

    var $cs;

    beforeEach(module('angular-appworks'));

    beforeEach(inject(function (_$contentServer_) {
        $cs = _$contentServer_;
    }));

    it('should expose a method to get root items', function () {
        expect($cs.rootItems).not.toBeUndefined();
    });

    xit('should return items with parent id of id passed in', function () {
        var collection;
        $cs.rootItems(3, function (items) {
            collection = items;
            expect(collection[0].parent).toEqual(3);
        });
    });
});
