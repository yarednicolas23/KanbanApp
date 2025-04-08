# Kanban Board Mobile App

A React Native application for managing tasks using a Kanban board approach. This app allows users to create, update, and organize tasks in different columns (To Do, In Progress, Done).

## Features

- User authentication (login/register)
- Create, read, update, and delete tasks
- Drag and drop tasks between columns
- Real-time updates using Firebase
- Responsive and modern UI
- Task details view with editing capabilities

## Technical Requirements

- React Native
- TypeScript
- Firebase (Authentication and Realtime Database)
- React Navigation
- React Native Paper
- React Native Reanimated
- React Native Gesture Handler

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd KanbanApp
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a new Firebase project
   - Enable Authentication (Email/Password)
   - Enable Realtime Database
   - Add your Firebase configuration to `src/services/firebase.ts`

4. Run the application:
```bash
npm start
```

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── hooks/         # Custom React hooks
  ├── navigation/    # Navigation configuration
  ├── screens/       # Screen components
  ├── services/      # Firebase and other services
  ├── types/         # TypeScript type definitions
  └── utils/         # Utility functions
```

## Usage

1. Register a new account or login with existing credentials
2. Create new tasks using the + button
3. Drag and drop tasks between columns
4. Tap on a task to view/edit details
5. Update task status or delete tasks as needed

## Development

This project was developed using:
- React Native with Expo
- TypeScript for type safety
- Firebase for backend services
- React Native Paper for UI components
- React Navigation for screen management
- React Native Reanimated and Gesture Handler for animations and interactions

## License

MIT 