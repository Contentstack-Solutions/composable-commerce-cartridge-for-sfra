'use strict';

/**
 * Process payload
 * @param {Object} blockData block data
 * @return {Object} result
 */
function process(blockData) {
    if (blockData && blockData.tiles) {
        var tiles = [];
        blockData.tiles.forEach(function (tile) {
            var newTile = Object.assign({}, tile);
            if (newTile.$) {
                newTile.$.image = '';
                newTile.$.ctaUrl = '';
                newTile.$.title = '';
                newTile.$.highlightTitle = '';
            }
            var colSpan = 1;
            var rowSpan = 1;

            if (
                tile.layout_options &&
        tile.layout_options.layout &&
        tile.layout_options.layout.indexOf('x') > -1
            ) {
                var layoutParts = tile.layout_options.layout.split('x');
                colSpan = layoutParts[0] !== '' ? layoutParts[0] : 1;
                rowSpan = layoutParts[1] !== '' ? layoutParts[1] : 1;
            }
            if (tile.layout_options && tile.layout_options.highlight_title) {
                newTile.highlightTitle = tile.layout_options.highlight_title;
                if (tile.layout_options.$ && tile.layout_options.$.highlight_title) {
                    newTile.$.highlightTitle = tile.layout_options.$.highlight_title;
                }
            }
            newTile.colSpan = colSpan;
            newTile.rowSpan = rowSpan;
            if (
                tile.category &&
        tile.category.data &&
        tile.category.data.length > 0
            ) {
                var data = tile.category.data[0];
                var image = data.c_slotBannerImage
                    ? data.c_slotBannerImage
                    : data.image;

                var title = data.name;
                var ctaUrl = '/s/SFRADemo/' + data.id.replace(/-/g, '/');
                if (tile.overwrite) {
                    if (tile.overwrite.image && tile.overwrite.image.url) {
                        image = tile.overwrite.image.url;
                        if (newTile.$ && newTile.overwrite.$) {
                            newTile.$.image = tile.overwrite.$.image;
                        }
                    }
                    if (tile.overwrite.title && tile.overwrite.title.trim().length > 0) {
                        title = tile.overwrite.title;
                        if (newTile.$ && newTile.overwrite.$) {
                            newTile.$.title = tile.overwrite.$.title;
                        }
                    }
                    if (
                        tile.overwrite.cta &&
            tile.overwrite.cta.link &&
            tile.overwrite.cta.link.href &&
            tile.overwrite.cta.link.href.trim().length > 0
                    ) {
                        ctaUrl = tile.overwrite.cta.link.href;
                        if (newTile.$ && newTile.overwrite.cta.link.$) {
                            newTile.$.ctaUrl = tile.overwrite.cta.link.$.href;
                        }
                    }
                }
                newTile.image = image;
                newTile.title = title;
                newTile.ctaUrl = ctaUrl;
            }
            tiles.push(newTile);
        });
        blockData.tiles = tiles;
    }
    return blockData;
}

module.exports = {
    process: process,
};
