# 🧩 Contentstack Composable Commerce Cartridge for SFRA

A turnkey accelerator that integrates **Contentstack’s headless CMS, Personalize, and Live Preview** into **Salesforce Commerce Cloud (SFRA)** storefronts — enabling composable, content-driven commerce experiences with seamless editor workflows.

---

## 📘 Table of Contents

1. [Overview](#overview)
2. [Installation & Setup](#installation--setup)
   - [1. Clone and Register the Cartridge](#1-clone-and-register-the-cartridge)
   - [2. Import Business Manager Metadata](#2-import-business-manager-metadata)
   - [3. Configure Site Preferences](#3-configure-site-preferences)
3. [Architecture Overview](#architecture-overview)
4. [Controllers](#controllers)
5. [Middleware](#middleware)
6. [Services & API Requests](#services--api-requests)
   - [Contentstack Service Configuration](#contentstack-service-configuration)
   - [RequestData Properties](#requestdata-properties)
   - [Personalize Manifest Retrieval](#personalize-manifest-retrieval)
   - [Switching to Live Preview](#switching-to-live-preview)
7. [Content Processing](#content-processing)
8. [Templates & Fallback Rendering](#templates--fallback-rendering)
9. [Utility Functions](#utility-functions)
   - [rteToHtml](#rtetohtml)
   - [cslp](#cslp)
   - [isJsonRteEmpty](#isjsonrteempty)
10. [Hooks & OCAPI Extensions](#hooks--ocapi-extensions)
11. [Developer Tips](#developer-tips)
12. [License](#license)

---

## Overview

The **Contentstack Cartridge for SFRA** provides an end-to-end integration between **Salesforce Commerce Cloud Storefront Reference Architecture (SFRA)** and **Contentstack**, enabling teams to deliver **content-rich, personalized storefronts** that are fully composable and CMS-managed.

It extends SFRA controllers, middleware, and templates to:
- Fetch and render content directly from Contentstack Delivery, Preview, or Personalize APIs.
- Inject CMS-managed components like header, footer, and consent banners into every page.
- Expose personalization variants and live preview capabilities.
- Allow fallback to native SFRA rendering when CMS data is not available.

---

## Installation & Setup

### 1. Clone and Register the Cartridge

```bash
git clone https://github.com/Contentstack-Solutions/composable-commerce-cartridge-for-sfra.git
```

Copy the `contentstack-sfcc-cartridge` folder into your `cartridges` directory.

Then update your **Cartridge Path** under:
`Business Manager → Administration → Sites → Manage Sites → <your-site> → Settings → Cartridges`

Add (ensure it appears *before* `app_storefront_base`):

```
int_contentstack:app_storefront_base
```

> If you have multiple custom cartridges, put `int_contentstack` before those that render templates relying on CMS content.

---

### 2. Import Business Manager Metadata

Import both metadata artifacts located under `/metadata` in this repo:

- `services.xml`
- `sites/RefArch/preferences.xml`

This step automatically registers:
- **Service definitions** for Contentstack Delivery and Personalize APIs.
- **Site Preferences** for environment/credential configuration (CMS Configuration group).

**Business Manager path:** `Administration → Site Development → Import & Export`

---

### 3. Configure Site Preferences

In **Business Manager → Merchant Tools → Site Preferences → Custom Preferences → CMS Configuration**, populate the following:

| Preference | Description |
|-------------|-------------|
| `cmsApiKey` | Contentstack API Key |
| `cmsAccessToken` | Delivery Token |
| `cmsEnvironment` | Environment name (e.g., `production`, `staging`) |
| `cmsBranch` | Contentstack branch name |
| `cmsApiEndpoint` | Delivery API endpoint (`https://cdn.contentstack.io`) |
| `cmsEdgeApiEndpoint` | Personalize Edge endpoint (`https://personalize-edge.contentstack.com`) |
| `cmsPreviewApiEndpoint` | Preview API endpoint |
| `cmsPreviewToken` | Preview token for Live Preview |
| `cmsPersonalizeEndpoint` | (If provided) Personalize base URL; otherwise use `cmsEdgeApiEndpoint` |
| `cmsPersonalizeProjectUID` | Personalize Project UID |
| `livePreviewUtilsURL` | URL to the Contentstack Live Preview Utilities script |

> Tip: Keep **Prod vs Non-Prod** credentials separate across sites/instances. Never commit secrets.

---

## Architecture Overview

The integration cartridge is located at:
```
contentstack-sfcc-cartridge/cartridges/int_contentstack
```

### Key Modules

| Layer | Folder | Description |
|--------|---------|-------------|
| **Controllers** | `cartridge/controllers/` | Extend SFRA controllers to inject CMS data |
| **Middleware** | `cartridge/scripts/middleware/` | Fetch and inject global CMS content (header/footer/consent) |
| **Helpers** | `cartridge/scripts/helpers/` | Data fetching and rendering logic (pageHelpers, cmsHelper) |
| **Services** | `cartridge/scripts/services/` | Defines Contentstack HTTP service and personalization requests |
| **Content Processors** | `cartridge/scripts/content/processors/` | Normalize and transform content per type |
| **Templates** | `cartridge/templates/` | ISML templates for content rendering |
| **Lib** | `cartridge/scripts/lib/` | Utilities for JSON RTE, structured text, and Live Preview |

---

## Controllers

### Core Extensions

- **Home.js**, **Product.js**, **Search.js**  
  Append to SFRA’s base routes (e.g., `Home-Show`, `Product-Show`) and fetch CMS data via:
  ```js
  pageHelpers.getPage(contentType, request, { query, includes, context })
  ```

- **Contentstack.js**  
  Implements a POST endpoint `Contentstack-TrackEvent` that forwards **Personalize events** (IMPRESSION / EVENT) to the Edge API. Uses cookies like `cs-personalize-user-uid` to correlate sessions.

- **Page.js**, **Account.js**, **Default.js**, **ConsentTracking.js**  
  Extend SFRA rendering to include CMS-managed global components (header, footer, tracking consent).

Each controller merges CMS data into `res.viewData`, allowing templates to access fields like `cmsData`, `cmsHeader`, `cmsFooter`, and `cmsConsent`.

---

## Middleware

**`scripts/middleware/cmsComponents.js`**
- Executes before rendering any controller response.
- Fetches entries for `header`, `footer`, and `tracking_consent` using the Contentstack Delivery API.
- Injects them into `res.viewData` as `cmsHeader`, `cmsFooter`, and `cmsConsent`.

**Why it matters:**  
Ensures all storefront pages — PDPs, PLPs, Account, etc. — share consistent, CMS-managed global sections, fully compatible with Live Preview and Personalize.

---

## Services & API Requests

**File:** `scripts/services/contentstack.js` defines the Contentstack service clients and request builders.

### Contentstack Service Configuration

- **Delivery / Preview API:** Used for structured content retrieval.
- **Edge Personalize API:** Used to fetch the personalization manifest and variants.
- **Preview Switching:** Automatically switches endpoints and tokens when Live Preview mode is active.

### RequestData Properties

The service composes a **requestData** map used by `createRequest`. Typical properties include:

| Property | Description |
|-----------|-------------|
| `endpoint` | Base Delivery API endpoint |
| `preview_endpoint` | Preview API endpoint |
| `access_token` | Delivery Token |
| `preview_token` | Preview Token (for Live Preview) |
| `api_key` | API Key |
| `environment` | Target environment |
| `branch` | Branch name |
| `edge_api_endpoint` | Personalize Edge endpoint |
| `personalize_project_uid` | Personalize Project UID |
| `locale` | Locale auto-mapped from `request.locale` (e.g., `en_US` → `en-us`) |
| `live_preview` | Boolean flag enabling Preview mode |
| `preview_timestamp` | Optional timestamp for historical snapshot preview |
| `content_type_uid` | Current content type (used in headers for Preview/LP) |
| `variant` | Current active variant for personalized responses |
| `headers` | Extra headers prepared by `prepareHeaders()` |

> Note: Exact keys depend on the route and whether Live Preview / Personalize is active.

### Personalize Manifest Retrieval

When personalization is enabled, the **Personalize service** retrieves the manifest for the current visitor/session. Example service skeleton:

```js
var personalizeService = LocalServiceRegistry.createService(
  'Contentstack.Personalize.Service',
  {
    createRequest: function (svc, requestData) {
      // Compose URL and headers using site prefs & cookies (user UID)
      // Return HTTP method + body if needed
    },
    parseResponse: function (svc, client) {
      return JSON.parse(client.text);
    }
  }
);
```

The manifest determines which **variants** apply and can be merged into `viewData` for both server- and client-side rendering.

### Switching to Live Preview

`cmsHelper.isLivePreviewEnabled()` checks site preferences and request context to decide if Preview mode should be used. When enabled:

- Host switches to `cmsPreviewApiEndpoint`.
- `preview_token`, `live_preview`, and content-type headers are added.
- `common/scripts.isml` injects:
  ```html
  <script type="module" src="${pdict.livePreviewUtilsURL}"></script>
  ```
  enabling Contentstack’s Live Preview Utilities.

---

## Content Processing

**Router:** `scripts/content/ContentstackManager.js`  
Determines which processor to apply based on the fetched entry’s content type.

**Processors:** `scripts/content/processors/`

| Processor | Purpose |
|------------|----------|
| `home.js` | Handles modular blocks (e.g., category tiles, hero banners). Normalizes layouts (e.g., `2x3`), CTAs, and spans via `modular-blocks/categoryTiles.js`. |
| `product_page.js` | PDP-specific transforms and enrichment of product content. |
| `default.js` | Pass-through fallback for unmapped content types; adds standard flags. |

Processors output a normalized `cmsData` shape that templates can render directly.

---

## Templates & Fallback Rendering

**Key templates:**

- **Home:** `templates/home/homePage.isml`
- **PDP:** `templates/product/productDetails.isml`
- **PLP:** `templates/search/searchResultsNoDecorator.isml`

Each main template checks for CMS data before rendering:

```isml
<isif condition="${!empty(pdict.cmsData)}">
    <isinclude template="pages/global-modular-blocks"/>
<iselse>
    <!-- Default SFRA rendering -->
    <isinclude template="home/homePageDefault"/>
</isif>
```

> If no CMS data is available, the page falls back to standard SFRA HTML output — ensuring the storefront remains fully functional.

**CMS Components:** `templates/default/content/components/*`  
Examples: `banner.isml`, `categoryTiles.isml`, `productList.isml`, `emailSignup.isml`, `generalContent.isml`.

**Common:**  
`templates/common/scripts.isml` injects `main.js` and conditionally loads **Live Preview Utils** (ESM) when `pdict.isLivePreview` is true.

---

## Utility Functions

### rteToHtml

**File:** `scripts/helpers/cmsHelper.js`

```js
rteToHtml(doc)
```
Converts Contentstack JSON RTE to HTML using Live Preview utilities. Use in templates when rendering rich text fields to ensure proper markup.

### cslp

**File:** `scripts/lib/custom-utils.js`

```js
cslp(entry, field, index)
```
Convenience helper to access Contentstack Live Preview (`$`) metadata on a field — useful for fine-grained field highlighting and inspection in Visual Builder.

### isJsonRteEmpty

**File:** `scripts/lib/custom-utils.js`

```js
isJsonRteEmpty(doc)
```
Returns `true` if a JSON RTE field is effectively empty — avoids rendering empty containers in ISML.

---

## Hooks & OCAPI Extensions

**File:** `hooks.json`

| Hook | Implementation | Description |
|-------|----------------|-------------|
| `app.mailingList.subscribe` | `scripts/hooks/subscription.js` | Creates `CustomObject('newsletter')` on signup. |
| `dw.ocapi.shop.product.modifyGETResponse` | — | Adds a CMS-friendly short URL to product responses (no `/s/<SiteID>`). |
| `dw.ocapi.shop.category.modifyGETResponse` | — | Adds a CMS-friendly short URL to category responses. |

These URL enrichments power the **Contentstack Product and Category Picker**, automatically populating PDP and PLP URLs in the CMS.

---

## Developer Tips

- Use `pageHelpers.getPage()` to fetch any content type — processors handle normalization automatically.
- Always guard template rendering with a `cmsData` check to preserve SFRA fallbacks.
- To debug personalization, log/inspect responses from `Contentstack-TrackEvent` and the Personalize service.
- Add new processors under `scripts/content/processors/` and register content types in `config/cmsConstants.js`.
- Keep **Cartridge Path** ordering correct: `int_contentstack` before templates that depend on CMS content.

---

## License

© Contentstack Solutions — Released under the MIT License.  
For support or contributions, visit the [official GitHub repository](https://github.com/Contentstack-Solutions/composable-commerce-cartridge-for-sfra).
