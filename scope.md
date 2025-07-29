# Inventory Project

Lite inventory management application

# Steps to build the application:

## 1- Gather Requirements:

- multi-tenent/ multi-user application
- user authentication and authorization
- user can create an organization (later: based on permission)
- user to tenant many to many relationship
- user can create Item with Item number, description, initial qty, pictures
- user can ceate location : location , bin
- user can create Markets: selling/buying venues with links to different selling/buying platform an Item can be sold/bougt at
- user can add qty to items and sell qty. total qty on hand will auto calculate
- user can edit item details
- user can place certain qty on hold
- user can adjust qty for reconciliation
- user can assign qty to location/bin.
- user can transfer qty between locations/bins•
- user can search for an item
- user can see transactions history (allow filter by item, location, bin, trx_type)
- user can see (QOH) per location
- later:
- user can see location history
- user can see item details history
- user can see item history
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

### a- Divide the application INTO pages:

1- Think about the overall and page-level UI
2- Break the UIINTO components and establish the component tree
3- Build a static version (without state and data)

### b- Divide the application INTO feature categories

#### Feature categories:

1- User : login, signup, profile
2- Organization
3- Items
4- Settings:
4a- Items Settings (Category, Type, variety, ...etc.)
4b- Location (sublocations)
4c- Transaction settings: transaction types
6- Transactions (buy- sell - transfer)
7- Reports (Insights)

#### Plan

- gather the website content: copy, images,...etc X
- build the site map: what pages are needed and how they relate to each other (hierarchy)
- what Sections each page needs? this should be guided by the content.
- website personality

#### Pages: ( linked to feature categories)

1- Homepage: /TBD: dashboard?
2- Items overview: /items (list items; find item; edit item; create item; delete item)
2a- Item details/ actions: /item/:itemId
3- Transactions (buy; sell; transfer; adjust; scrap)
4- Reports: /Reports
5- Settings: /settings
6- Authentication: login/signup
7- Profile:

#### scetch:

- components and how they will be used in the layout patterns,
- Rough scetch: get ideas out of your head in a design software.
- iterative process
- No need for complete design at this point

## ##Design:

design in the browser. design visual styles.
use branding if it exists

#### state:

Q: 1- Think about state: when to use? types of state (local / global/ server / client)
A: most state is Global Remote

Q: 2- Establish data flow
A: inventory.erd inventory.drawio

### c-Design decisions:

#### Technology decicisions:

(what libraries we will use)

- Framework: NextJs
- Global local state: Context API or redux
- CSS: Tailwind
- Database: Supabase
- Authentication: NextAuth (possibly clerk)

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

## Form future flow

│ User Submits Form │
│ ↓ │
│ JavaScript Available? │
│ ↓ │
│ ┌─── YES ────┐ │
│ ↓ ↓ │
│ Enhanced Mutation │
│ Submission Available? │
│ Works? ↓ │
│ ↓ ┌─ YES ─┐ │
│ YES ↓ ↓ │
│ ↓ Use Fails? │
│ Success Mutation ↓ │
│ ↓ ↓ YES │
│ END Success ↓ │
│ ↓ Fall back to │
│ END Native Form │
│ ↓ │
│ useEffect │
│ Handles │
│ Response │
│ ↓ │
│ END │
│ │
│ JavaScript Disabled? │
│ ↓ │
│ YES │
│ ↓ │
│ Native Form │
│ Submission │
│ ↓ │
│ Page Refresh │
│ (No useEffect) │
│ ↓ │
│ END
