# Inventory Project

Lite inventory management application

# Steps to build the application:

## 1- Gather Requirements:

- multi-tenent/ multi-user application
- user authentication and authorization
- user can create an organization based on permission
- user to tenant many to many relationship
- user can create Item with Item number description initial quantity pictures
- user can ceate location : location , isle, bin, number
- user can create selling venues with links to different selling platform an Item can be sold at
- user can add quantity to items and sell quantity. total quantity on hand will auto calculate
- user can edit item details
- user can place certain quantity on hold
- user can adjust quantity for reconciliation
- user can assign quantity to location.
- user can transfer quantity between locations
- user can search for an item
- user can see item details history
- user can see item history
- user can see location status (QOH)
- user can see location history
- user can see transactions history
- user can see full history

### Analysis: Define:

Q: Who is the project for? myself? client? Saas?
A: myself then possibly saas

Q: What is the website for?
A: provide information => manage inventory
(intersection between business goals and user goals)

Q: Who is the target audiance?
A: small business / individual with less than 1000 items, living in the united states, with need to sell on multiple platforms like ebay, fb-marketplace, craigslist ...etc.
todo: market research, competition, user personas?

## 2- Design:

### a- Divide the application into pages:

1- Think about the overall and page-level UI
2- Break the UI into components and establish the component tree
3- Build a static version (without state and data)

### b- Divide the application into feature categories

#### Feature categories:

1- User
2- Organization
3- Items
4- Settings:
4a- Items Settings (Category, Type, variety, ...etc.)
4b- Location (sublocations)
6- Transactions (buy- sell - transfer)
7- Reports (Insights)

#### Plan

- gather the website content: copy, images,...etc X
- build the site map: what pages are needed and how they relate to each other (hierarchy)
- what Sections each page needs? this should be guided by the content.
- website personality

#### Pages: ( linked to feature categories)

1- Homepage: /
2- Items: /items (list items;delete item)
2a- Item actions: /item/:itemId
3- Transactions (buy; sell; transfer)
4- Reports: /Reports
5- Settings: /settings

#### scetch:

- components and how they will be used in the layout patterns,
- Rough scetch: get ideas out of your head in a design software.
- iterative process
- No need for complete design at this point

## ##Design:

design in the browser. design visual styles.
use branding if it exists

#### state:

Q: 1- Think about state: when to use? types of state (local / global/ server / clien)
A: most state is Global Remote

Q: 2- Establish data flow
A: TBD

### c-Design decisions:

#### Technology decicisions:

(what libraries we will use)

- NextJs
- Tailwind
- Supabase for database
- NextAuth for authentication (possibly clerk)

#### Website personality:

mix of Startup/upbeat with a touch of calm/peacefull

#### - Font:

medium sized soft sans-serif font for main headers for the calm/caring effect and serif for the rest.
Vazirmatn, Open_sans

#### - Color:

blue, green, purple for primary color, light grey for background. colors are light in general. ( experment with pastel for calm) can use gradient.

#### - Images:

always used. 3D illustrations. patterns and shapes.

#### - Icons, Shadows, Border-radius

commonly used

## Test and Optimize:

- Make sure the site works well on chrome,firefox, safari, Edge
- Make sure responsive designs are working on actual mobile devices
- optimize images
- fix accessibility problems
- Lighthouse performance test in chrome devtools and try to fix reported issues
- SEO

## Launch

## Maintain and Update

- indtall analytics software ( google analytics, fathom...etc.)
