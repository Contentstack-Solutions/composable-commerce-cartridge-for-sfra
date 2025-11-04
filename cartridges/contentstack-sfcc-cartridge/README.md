# int\_contentstack (SFRA)

This is the repository for the int\_contentstack cartridge. This cartridge enhances the app\_storefront\_base cartridge by integrating ContentStack content management system.

### Update Site Cartridge Path(s)

The cartridge requires the `app_storefront_base` cartridge from [Storefront Reference Architecture](https://github.com/salesforceCommerceCloud/storefront-reference-architecture).

To update your site cartridge path:

1. Log in to Business Manager.
2. Go to **Administration** > **Sites** > **Manage Sites**.
3. Select the site where you want to use this cartridge. Example site identifier: `RefArch`.
4. Click the **Settings** tab.
5. In the **Cartridges** field, add the new cartridge path: `int_contentstack`. It must be added _before_ the path for `app_storefront_base`. Example path: `int_contentstack:app_storefront_base`
6. Click **Apply**

### Import Custom Metadata

1. Zip the [metadata](./metadata) folder with any zip tool.
2. Log in to Business Manager
3. Go to **Administration** > **Site Development** > **Site Import & Export**
4. Click **Browse**
5. Select the `metadata.zip` file from the root of the repo
6. Click **Upload**
7. Select `instance/metadata.zip`
8. Click **Import**
9. Click **OK**

# Getting Started

1. Clone this repository. (The name of the top-level folder is int\_contentstack.)
2. In the top-level int\_contentstack folder, enter the following command: `npm install`. (This command installs all of the package dependencies required for this plugin.)
3. In the top-level int\_contentstack folder, edit the paths.base property in the package.json file. This property should contain a relative path to the local directory containing the Storefront Reference Architecture repository. For example:
```
"paths": {
    "base": "../storefront-reference-architecture/cartridges/app_storefront_base/"
  }
```
4. In the top-level int\_contentstack folder, enter the following command: `npm run build`
5. Use any WebDav client to upload your cartridge like Prophet or CyberDuck.


# NPM scripts

* Use the provided NPM scripts to compile the cartridge.

## Compiling your application

* npm run compile:scss - Compiles all scss files into css.
* npm run compile:js - Compiles all js files and aggregates them.
* npm run compile:fonts - Compiles all fonts files.
* npm run build - Combines all three commands compiling scss, js and font files.

## Linting your code

* npm run lint - Execute linting for all JavaScript and SCSS files in the project. You should run this command before committing your code.

