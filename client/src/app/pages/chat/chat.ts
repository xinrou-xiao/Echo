import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

type ChatContact = {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  lastActive: string;
};

type ChatMessage = {
  id: number;
  from: 'me' | 'them';
  text: string;
  timestamp: string;
};

type ChatThread = {
  contactId: number;
  messages: ChatMessage[];
};

const SAMPLE_CONTACTS: ChatContact[] = [
  {
    id: 1,
    name: 'Emma Wilson',
    avatar: 'https://i.pravatar.cc/80?img=32',
    lastMessage: 'That sounds perfect! 😄',
    lastActive: '2m ago'
  },
  {
    id: 2,
    name: 'Liam Chen',
    avatar: 'https://i.pravatar.cc/80?img=15',
    lastMessage: 'Looking forward to meeting.',
    lastActive: '15m ago'
  },
  {
    id: 3,
    name: 'Sophia Patel',
    avatar: 'https://i.pravatar.cc/80?img=28',
    lastMessage: 'Let me know what you think.',
    lastActive: '1h ago'
  }
];

const SAMPLE_THREADS: ChatThread[] = [
  {
    contactId: 1,
    messages: [
      { id: 1, from: 'them', text: 'Hey! Are we still on for Friday?', timestamp: '09:12' },
      { id: 2, from: 'me', text: 'Absolutely! I found a cozy cafe nearby.', timestamp: '09:13' },
      {
        id: 3,
        from: 'them',
        text: 'That sounds perfect! 😄',
        timestamp: '09:15'
      }
    ]
  },
  {
    contactId: 2,
    messages: [
      {
        id: 1,
        from: 'them',
        text: 'Thanks for the recommendation last night!',
        timestamp: '20:18'
      },
      {
        id: 2,
        from: 'me',
        text: 'Anytime! Let me know what you think after trying it.',
        timestamp: '20:20'
      }
    ]
  },
  {
    contactId: 3,
    messages: [
      {
        id: 1,
        from: 'them',
        text: 'I just sent over the playlist. Hope you like it!',
        timestamp: '17:45'
      },
      { id: 2, from: 'me', text: 'Listening now! Loving the vibe already.', timestamp: '17:47' }
    ]
  }
];

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class ChatPage {
  protected readonly contacts = SAMPLE_CONTACTS;
  private readonly threads = SAMPLE_THREADS;
  protected selectedContactId = this.contacts[0]?.id ?? 0;
  protected draftMessage = '';

  constructor(private readonly router: Router) {}

  protected selectContact(contactId: number): void {
    this.selectedContactId = contactId;
    this.draftMessage = '';
  }

  protected messagesForSelected(): ChatMessage[] {
    const contactId = this.selectedContactId;
    return this.threads.find((thread) => thread.contactId === contactId)?.messages ?? [];
  }

  protected selectedContact(): ChatContact | undefined {
    const contactId = this.selectedContactId;
    return this.contacts.find((contact) => contact.id === contactId);
  }

  protected sendMessage(): void {
    const text = this.draftMessage.trim();
    if (!text) {
      return;
    }

    const contactId = this.selectedContactId;
    const thread = this.threads.find((t) => t.contactId === contactId);
    if (!thread) {
      return;
    }

    const newMessage: ChatMessage = {
      id: Date.now(),
      from: 'me',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    thread.messages = [...thread.messages, newMessage];

    this.draftMessage = '';
  }

  protected goToMatch(): void {
    void this.router.navigate(['/match']);
  }
}
