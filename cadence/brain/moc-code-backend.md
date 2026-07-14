---
type: moc
tags: [code/backend]
aliases: []
created: 2026-07-14
updated: 2026-07-15
related: []
sources: []
---

# Backend code index

## Routing & Scheduling
- [[routes-api-php]]
- [[routes-console-php]]

## Configuration
- [[config-attendance-php]]
- [[config-broadcasting-php]]
- [[config-reverb-php]]

## Models
- [[app-models-user-php]]
- [[app-models-table-php]]
- [[app-models-category-php]]
- [[app-models-menuitem-php]]
- [[app-models-order-php]]
- [[app-models-orderitem-php]]
- [[app-models-inventoryitem-php]]
- [[app-models-timeentry-php]]

## Controllers
- [[app-http-controllers-api-authcontroller-php]]
- [[app-http-controllers-api-statuscontroller-php]]
- [[app-http-controllers-api-ownercontroller-php]]
- [[app-http-controllers-api-cashiercontroller-php]]
- [[app-http-controllers-api-tablecontroller-php]]
- [[app-http-controllers-api-categorycontroller-php]]
- [[app-http-controllers-api-menuitemcontroller-php]]
- [[app-http-controllers-api-inventoryitemcontroller-php]]
- [[app-http-controllers-api-menuiteminventoryitemcontroller-php]]
- [[app-http-controllers-api-ordercontroller-php]]
- [[app-http-controllers-api-analyticscontroller-php]]
- [[app-http-controllers-api-restockcontroller-php]]
- [[backend-app-http-controllers-api-kitchenclockcontroller-php]]
- [[backend-app-http-controllers-api-employeecontroller-php]]
- [[app-http-controllers-api-timeentrycontroller-php]]

## Models: Enums
- [[app-enums-tableshape-php]]
- [[app-enums-userrole-php]]
- [[app-enums-orderstatus-php]]
- [[app-enums-paymentmethod-php]]

## Events
- [[app-events-orderplaced-php]]
- [[app-events-orderstatusupdated-php]]

## Middleware
- [[app-http-middleware-ensureuserhasrole-php]]

## Services
- [[app-services-checkout-paymentconfirmationservice-php]]
- [[app-services-receipts-printagentclient-php]]

## Console Commands
- [[backend-console-commands-closeforgottentimeentries-php]]

## Migrations
- [[database-migrations-2026-07-14-000001-create-personal-access-tokens-table-php]]
- [[database-migrations-2026-07-14-000002-add-role-to-users-table-php]]
- [[database-migrations-2026_07_14_000003_create_tables_table-php]]
- [[database-migrations-2026_07_14_000004_create_categories_table-php]]
- [[database-migrations-2026_07_14_000005_create_menu_items_table-php]]
- [[database-migrations-2026_07_14_000006_create_inventory_items_table-php]]
- [[database-migrations-2026_07_14_000007_create_menu_item_inventory_item_table-php]]
- [[database-migrations-2026_07_14_000008_create_orders_table-php]]
- [[database-migrations-2026_07_14_000009_create_order_items_table-php]]
- [[database-migrations-2026_07_14_000011_create_time_entries_table-php]]
- [[backend-database-migrations-2026-07-14-000012-add-pin-to-users-table-php]]
- [[backend-database-migrations-2026-07-14-000013-add-active-to-users-table-php]]
- [[database-migrations-2026_07_14_000014_add_threshold_to_inventory_items_table-php]]

## Factories
- [[database-factories-userfactory-php]]
- [[database-factories-tablefactory-php]]
- [[database-factories-categoryfactory-php]]
- [[database-factories-menuitemfactory-php]]
- [[database-factories-inventoryitemfactory-php]]
- [[database-factories-orderfactory-php]]
- [[database-factories-orderitemfactory-php]]
- [[database-factories-timeentryfactory-php]]

## Tests
- [[tests-feature-auth-logintest-php]]
- [[tests-feature-auth-logouttest-php]]
- [[tests-feature-tables-tablelayouttest-php]]
- [[tests-feature-menu-categorytest-php]]
- [[tests-feature-menu-menuitemtest-php]]
- [[tests-feature-inventory-inventoryitemtest-php]]
- [[tests-feature-inventory-inventorydecrementtest-php]]
- [[tests-feature-inventory-menuiteminventorylinktest-php]]
- [[backend-tests-feature-inventory-restocktest-php]]
- [[tests-feature-orders-ordertest-php]]
- [[tests-feature-analytics-analyticssalestest-php]]
- [[tests-feature-analytics-analyticsmenuitemstest-php]]
- [[tests-feature-timeentries-timeentrytest-php]]
- [[backend-tests-feature-kitchen-clocktest-php]]
- [[backend-tests-feature-timeentries-autoclosatetimeentriestest-php]]
- [[backend-tests-feature-timeentries-timeentryindextest-php]]
- [[backend-tests-feature-employees-employeeindextest-php]]
- [[backend-tests-feature-employees-employeestoretest-php]]
- [[backend-tests-feature-employees-employeeupdatetest-php]]
- [[backend-tests-feature-employees-employeedeactivatetest-php]]

## Bootstrap
- [[bootstrap-app-php]]

## Other
- [[frontend-src-components-kitchenclocpad-test-tsx]]
- [[frontend-src-components-kitchenclocpad-tsx]]
- [[frontend-src-api-kitchenclock-ts]]
- [[frontend-src-types-kitchenclock-ts]]
