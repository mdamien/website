const memoize = require('timed-memoize').default;
const path = require('path');
const sharp = require('sharp');

exports.createSettingsItemResolver = () => {
  return {
    resolve(source, args, context) {
      return context.nodeModel.getNodeById({id: source.id});
    }
  };
};

exports.createRelationResolver = property => {
  return {
    resolve(source, args, context) {
      return context.nodeModel.getNodesByIds({ids: source[property]}).filter(x => !!x);
    }
  };
};

exports.createBacklinkResolver = (relationType, propName) => {
  return {
    resolve(source, args, context) {
      const nodes = context.nodeModel.getAllNodes({type: relationType});

      return nodes.filter(node => node[propName] && node[propName].includes(source.id));
    }
  };
};

exports.createSameModelRelationResolver = (relationType, propName) => {
  const forwardResolver = exports.createRelationResolver(propName).resolve,
        backwardResolver = exports.createBacklinkResolver(relationType, propName).resolve;

  return {
    resolve(source, args, context) {

      const forwardNodes = forwardResolver(source, args, context),
            backwardNodes = backwardResolver(source, args, context);

      // Merging backward & forward links into a single unified list
      const data = {};

      forwardNodes
        .concat(backwardNodes)
        .forEach(node => {
          data[node.id] = node;
        });

      return Object.values(data);
    }
  };
};

exports.createCoverImageResolver = settings => {

  const resolver = source => {
    if (!source.cover)
      return null;

    const cover = source.cover;

    const ext = path.extname(cover.file),
          name = path.basename(cover.file, ext);

    const output = `${name}.cover${ext}`;
    const socialOutput = `${name}.social.png`;

    const crop = cover.crop;

    const data = {
      url: `${settings.prefix}/static/${output}`
    };

    const socialUrl = `${settings.prefix}/static/${socialOutput}`;

    return new Promise((resolve, reject) => {

      const img = () => sharp(path.join(settings.assetsPath, cover.file)).extract({
        left: crop.x,
        top: crop.y,
        width: crop.width,
        height: crop.height
      });

      // TODO: only use a single stream?
      return img()
        .toFile(path.join(settings.publicPath, output), err => {
          if (err)
            return reject(err);

          if (cover.processed) {
            Promise.all([
              settings.processing(img(), cover.crop, {
                rows: 60,
                gamma: cover.gamma
              }),
              settings.processing(img(), cover.crop, {
                rows: 120,
                gamma: cover.gamma
              }),
              settings.processing(img(), cover.crop, {
                rows: 240,
                gamma: cover.gamma
              })
            ])
            .then(([small, medium, large]) => {
              if (settings.rasterize) {
                settings.rasterize(medium, {
                  rows: 120,
                  output: path.join(settings.publicPath, socialOutput)
                }, {...settings, sharp})
                .then(raster => {
                  resolve({
                    ...data,
                    processed: {
                      small,
                      medium,
                      large,
                      raster: {
                        ...raster,
                        url: socialUrl
                      }
                    }
                  });
                })
                .catch(reject);

              } else {
                resolve({
                  ...data,
                  processed: {
                    small,
                    medium,
                    large
                  }
                });
            }
            }).catch(reject);
          }
          else {
            resolve(data);
          }
        });
    });
  };

  return {
    resolve: memoize(resolver, {
      timeout: 60 * 1000,
      resolver: args => args[0].id
    })
  };
};
