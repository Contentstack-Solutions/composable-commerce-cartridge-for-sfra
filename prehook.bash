# !/bin/bash

# get the private cartridges
git submodule add -b main https://github.com/Contentstack-Solutions/sfcc-private-cartridges.git content
# copy the cartridges to cartridges folder
cp -a content/. cartridges


# Remove content submodule
git submodule deinit -f content
git rm -f content
rm -rf .git/modules/content

# Install npm dependencies for root and cartridges
npm install && cd cartridges && npm install && cd ../

# Build the cartridges
npm run build && cd cartridges && npm run build && cd ../