# **App Name**: GlobalTalk

## Core Features:

- User Authentication: User registration and authentication (without database). Store users locally for session during use. Use NextAuth for production authentication.
- Language Preference: Select preferred language for each user during onboarding.
- Real-Time Messaging: Real-time messaging interface (no message persistence)
- Sentiment Analysis: Utilize an LLM as a tool to automatically detect the sentiment/tone of the sent message.
- Real-time Translation: Utilize an LLM to translate messages in real time between users based on language preferences. Display an indicator where translation occurs.
- Translation Source Indicator: Show the translation source in UI.

## Style Guidelines:

- Primary color: Soft blue (#64B5F6), promoting calmness and clarity for international communication.
- Background color: Light gray (#F5F5F5), providing a neutral backdrop that is easy on the eyes.
- Accent color: Muted orange (#FFAB40), used for subtle highlights and interactive elements without being overwhelming.
- Font pairing: 'Inter' (sans-serif) for body text and 'Space Grotesk' (sans-serif) for headlines, offering a modern, readable interface.
- Use universal icons for common actions like send, translate, and settings, ensuring they are easily understandable across different cultures.
- Use smooth, subtle animations for message transitions and translation alerts to enhance user experience without causing distractions.