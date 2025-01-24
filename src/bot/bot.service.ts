import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class BotService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      baseURL: 'https://models.inference.ai.azure.com',
      apiKey: process.env.GITHUB_TOKEN,
    });
  }

  async getResponse(message: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: message }],
    });
    return (
      response.choices[0].message?.content || 'Sorry, I am unable to respond.'
    );
  }
}
