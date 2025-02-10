# Chatari Server 🚀

This project is a NestJS-based server that provides real-time chat and bot functionality using websockets and OpenAI integration.

## Project Structure 📂

- **Controllers & Modules**  
  The main application logic is built using NestJS modules and controllers. See [`src/app.module.ts`](src/app.module.ts) and [`src/app.controller.ts`](src/app.controller.ts).
- **Chat Functionality** 💬  
  The real-time chat logic is implemented in the [`ChatModule`](src/chat/chat.module.ts) with the key components:

  - [`ChatGateway`](src/chat/chat.gateway.ts): Handles websocket connections.
  - [`ChatService`](src/chat/chat.service.ts): Manages chat logic, pairing, and message forwarding.

- **Bot Integration** 🤖  
  The OpenAI bot integration is provided by the [`BotService`](src/bot/bot.service.ts) in the [`BotModule`](src/bot/bot.module.ts).

- **Configuration** ⚙️  
  The application uses environment variables and is configured with the [NestJS ConfigModule](https://docs.nestjs.com/techniques/configuration).

## Setup 🛠️

1. **Install Dependencies** 📦

   Run the following command in the project root directory:

   ```sh
   npm install
   ```

2. **Environment Variables** 🌐

   Create an .env file in the project root and set the following (at minimum):

   ```env
   PORT=3001
   GITHUB_TOKEN=your-openai-api-key
   ```

## Running the Application ▶️

- **Development Mode** 🛠️

  ```sh
  npm run start:dev
  ```

- **Production Mode** 🚀

  ```sh
  npm run start:prod
  ```

The application listens on the port defined by the `PORT` environment variable (defaults to `3001` if not defined).

## Testing 🧪

- **Unit Tests** 🧩

  Run:

  ```sh
  npm run test
  ```

- **End-to-End (e2e) Tests** 🔄

  Run:

  ```sh
  npm run test:e2e
  ```

## Linting & Formatting 🧹

- **Linting** 🔍

  ```sh
  npm run lint
  ```

- **Prettier Formatting** ✨

  ```sh
  npm run format
  ```

## Deployment 🚀

For production deployment, build the project and run the compiled code:

1. Build the project:

   ```sh
   npm run build
   ```

2. Start the application:

   ```sh
   npm run start:prod
   ```

## References 📚

- [NestJS Documentation](https://docs.nestjs.com)

## License 📄

This project is open source and available for modification.
