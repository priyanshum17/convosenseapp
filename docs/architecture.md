# ConvoSense Architecture

This document outlines the architecture of the ConvoSense application, a real-time, cross-language communication platform.

## High-Level Overview

ConvoSense is a modern, full-stack web application built on a serverless architecture. It leverages a combination of cutting-edge technologies to provide a seamless and intuitive user experience. The architecture is designed to be scalable, maintainable, and performant.

## Core Components

The application is composed of the following core components:

- **Frontend**: A responsive and interactive user interface built with **Next.js**, **React**, and **TypeScript**.
- **UI Components**: A consistent and accessible design system powered by **ShadCN UI** and **Tailwind CSS**.
- **State Management**: A combination of **React Context API** and custom hooks for managing application state, including authentication and real-time chat data.
- **Backend & Database**: A serverless backend powered by **Firebase**, utilizing **Firestore** for real-time messaging and user data storage.
- **AI & Generative AI**: **Google's Gemini Pro** via **Firebase Genkit** for advanced AI-powered features, including real-time translation and sentiment analysis.
- **Deployment**: Hosted on **Firebase App Hosting** for a scalable and reliable deployment solution.

## Detailed Architecture

### Frontend Architecture

The frontend is built using the **Next.js App Router**, which enables a hybrid approach to rendering, combining server-side rendering (SSR) and client-side rendering (CSR) for optimal performance.

- **Pages & Layouts**: The `src/app` directory contains the application's pages and layouts, organized using a file-based routing system.
- **Components**: Reusable UI components are located in the `src/components` directory, separated into `ui` (generic components) and `global-talk` (feature-specific components).
- **Hooks**: Custom React hooks in `src/hooks` encapsulate business logic and state management, such as `useAuth` and `useGlobalTalk`.
- **Contexts**: The `src/contexts` directory contains React context providers for managing global state, such as `AuthProvider` and `GlobalTalkProvider`.
- **Styling**: **Tailwind CSS** is used for styling, with a custom theme defined in `tailwind.config.ts`.

### Backend Architecture

The backend is entirely serverless, relying on **Firebase** for all backend services.

- **Authentication**: User authentication is handled via a custom solution that uses **Firestore** to store user profiles.
- **Database**: **Firestore** is used as the real-time database for storing chat messages and user data. The data is structured in collections and documents, with real-time updates handled by Firestore's snapshot listeners.
- **AI Flows**: **Firebase Genkit** is used to define and manage AI-powered flows for translation and sentiment analysis. These flows are defined in the `src/ai/flows` directory and are called from the frontend to perform AI-related tasks.

### AI Integration

The AI integration is a key feature of ConvoSense, providing intelligent and context-aware communication assistance.

- **Translation**: The `translate-message` flow uses **Google's Gemini Pro** to translate messages between languages, providing context explanations, tone analysis, and learning nuggets.
- **Sentiment Analysis**: The `analyze-message-sentiment` flow uses **Google's Gemini Pro** to analyze the sentiment of messages, providing a sentiment score and confidence level.

## Data Flow

1.  **User Authentication**: A user logs in by providing a name and preferred language. The `AuthProvider` creates a new user document in Firestore and stores the user's session in local storage.
2.  **Real-Time Chat**: When a user sends a message, the `GlobalTalkProvider` calls the appropriate AI flows to perform translation and sentiment analysis. The message is then stored in Firestore, and real-time updates are pushed to all clients subscribed to the chat.
3.  **Translation & Sentiment Analysis**: The frontend calls the Genkit flows, which in turn call the Gemini Pro API to perform the requested AI tasks. The results are then returned to the frontend and displayed to the user.

## Scalability & Performance

The serverless architecture of ConvoSense is designed to be highly scalable. Firebase services, such as Firestore and App Hosting, automatically scale to meet demand. The use of Next.js with a hybrid rendering approach ensures that the application is performant and provides a fast user experience.
