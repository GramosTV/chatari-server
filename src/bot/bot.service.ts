import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI, { RateLimitError } from 'openai';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class BotService {
  private openai: OpenAI;
  private gemini: GoogleGenerativeAI;
  private geminiModel: GenerativeModel;
  private readonly rateLimitKey = 'openai:rateLimitedUntil';

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.openai = new OpenAI({
      baseURL: 'https://models.inference.ai.azure.com',
      apiKey: process.env.GITHUB_TOKEN,
    });
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_KEY);
    this.geminiModel = this.gemini.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });
  }

  async getResponse(message: string): Promise<string> {
    const now = new Date();
    const rateLimitUntilTimestamp = await this.cacheManager.get<number>(
      this.rateLimitKey,
    );
    if (rateLimitUntilTimestamp && now.getTime() < rateLimitUntilTimestamp) {
      const geminiResponse = await this.geminiModel.generateContent([message]);
      return geminiResponse.response.text() || 'Sorry, I am unable to respond.';
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: message }],
      });
      return (
        response.choices[0].message?.content || 'Sorry, I am unable to respond.'
      );
    } catch (error) {
      if (error instanceof RateLimitError) {
        const rateLimitedUntil = now.getTime() + 24 * 60 * 60 * 1000;
        await this.cacheManager.set(
          this.rateLimitKey,
          rateLimitedUntil,
          24 * 60 * 60,
        );
        console.warn(
          'OpenAI rate limit reached. Switching to Gemini for the next 24 hours.',
        );
      } else {
        console.error('OpenAI request failed:', error);
      }
      const geminiResponse = await this.geminiModel.generateContent([message]);
      return geminiResponse.response.text() || 'Sorry, I am unable to respond.';
    }
  }
}
