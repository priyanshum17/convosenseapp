# ConvoSense

Seamlessly communicate across languages with real-time translation, sentiment analysis, and cultural context.

**Live Demo:** [**https://studio--globaltalk-b92hf.us-central1.hosted.app**](https://studio--globaltalk-b92hf.us-central1.hosted.app)

## The Challenge

In our increasingly connected world, language barriers are a persistent challenge. Standard translation tools often fall short because they provide literal, word-for-word translations, failing to capture the subtle but critical elements of communication:

*   **Context:** Direct translations can miss the implied meaning or cultural connotations of a phrase.
*   **Tone:** A message that is neutral in one language might come across as blunt or rude in another.
*   **Formality:** Using the wrong level of formality can lead to awkwardness or disrespect in social and professional settings.
*   **Uncertainty:** Users are often left wondering if their translated message accurately conveys their true intent.

ConvoSense was built to solve these problems. It's not just a translator; it's a communication partner that empowers you to connect with others confidently and accurately.

## Core Features

ConvoSense is designed from the ground up to address the nuanced challenges of cross-language communication.

### 1. Intelligent, Context-Aware Translation
ConvoSense goes beyond literal translation. Powered by advanced AI, it analyzes the underlying meaning and idioms of your message to provide translations that are not only accurate but also contextually appropriate. This directly addresses concerns about translations not capturing the intended meaning.

### 2. Comprehensive Communication Insights
For every message you send to a user speaking a different language, you have the option to review a detailed breakdown before sending. This feature provides:
*   **Context Explanation:** Understand how cultural nuances and idioms were handled in the translation.
*   **Tone Explanation:** See how your message will likely be perceived (e.g., friendly, formal, polite) to avoid unintentional miscommunication.
*   **Formality Level:** Clearly see the formality level of the translated message, ensuring it's appropriate for your audience.

### 3. Translation Verification
The "Review & Send" feature gives you complete control. By reviewing the translation and its associated insights, you can feel confident that your message means exactly what you want it to mean before it's sent.

### 4. Integrated Language Learning
ConvoSense helps you learn as you communicate. Every translation includes a **"Learning Nugget"**—a small, digestible grammar or vocabulary tip related to your message. This helps you gradually become more fluent and less reliant on the tool over time.

### 5. Real-Time Sentiment Analysis
An icon next to each message gives you an at-a-glance understanding of its sentiment (positive, negative, or neutral), helping you better gauge the emotional context of the conversation.

### 6. Live User Presence
A green indicator shows which users are currently online, so you know who is available to chat in real-time.

## Tech Stack

ConvoSense is a modern, full-stack web application built with:

*   **Framework:** Next.js (with App Router)
*   **Language:** TypeScript
*   **AI/Generative AI:** Google's Gemini Pro via Firebase Genkit
*   **UI:** React, ShadCN UI Components, Tailwind CSS
*   **Backend & Database:** Firebase (Firestore for real-time chat)
*   **Deployment:** Firebase App Hosting

## Getting Started

To run this project locally, you will need a Firebase project.

### 1. Clone the repository:
```bash
git clone https://github.com/priyanshum17/convosenseapp
cd convosenseapp
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Set up Firebase:
1.  Create a project on the [Firebase Console](https://console.firebase.google.com/).
2.  Add a new "Web" app to your project.
3.  Copy the `firebaseConfig` object from your project settings.
4.  Create a `.env` file in the root of the project.
5.  Add your Firebase configuration to the `.env` file, prefixing each key with `NEXT_PUBLIC_`:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
    NEXT_PUBLIC_FIREBASE_APP_ID="1:..."
    ```

### 4. Run the development server:
```bash
npm run dev
```

The app will now be available at `http://localhost:9002`.
