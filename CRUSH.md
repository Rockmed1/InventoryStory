## Build, Lint, and Test Commands

- **Run development server:** `npm run dev`
- **Build for production:** `npm run build`
- **Start production server:** `npm run start`
- **Lint files:** `npm run lint`

## Code Style Guidelines

- **Imports:** Use absolute paths for imports. Organize imports in the following order: React, external libraries, internal modules.
- **Formatting:** Use Prettier for code formatting. Run `npx prettier --write .` to format the entire codebase.
- **Types:** Use Zod for schema validation. Define schemas in `app/_lib/validation/ZodSchemas.js`.
- **Naming Conventions:** Use camelCase for variables and functions. Use PascalCase for components.
- **Error Handling:** Use `try...catch` blocks for asynchronous operations. Use the `toast` utility for user-facing error messages.
- **Components:** Create components in the `app/_components` directory. Separate client and server components into their respective subdirectories.
- **Data Fetching:** Use React Query for data fetching. Define query keys and functions in a centralized location.
- **State Management:** Use Zustand for global state management. Create stores in the `app/_store` directory.
