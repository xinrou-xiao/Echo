import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, AfterViewChecked, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

type ChatContact = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastActive: string;
};

type ChatMessage = {
  id: string;
  from: 'me' | 'them';
  text: string;
  timestamp: string;
};

type ChatThread = {
  contactId: string;
  messages: ChatMessage[];
  currentPage: number;
  hasMore: boolean;
};

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class ChatPage {
  @ViewChild('chatMessages') private chatMessagesContainer!: ElementRef;
  protected contacts: ChatContact[] = [];
  private threads: ChatThread[] = [];
  protected selectedContactId = '';
  protected draftMessage = '';
  protected userId = '';
  private isInitialLoad = true;

  constructor(
    private readonly router: Router,
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    await this.authService.ready();
    const user = this.authService.profile();
    if (user && user._id) {
      this.userId = user._id;
      this.getFriendList(user._id);
    }
  }

  ngAfterViewChecked() {
    if (this.isInitialLoad) {
      this.scrollToBottom();
      this.isInitialLoad = false;
    }
  }

  private getFriendList(userId: string) {
    this.http.get(`${environment.apiUrl}/user/friend-list/${userId}`, { observe: 'response' })
      .subscribe({
        next: (response) => {
          if (response.status === 200) {
            const body = response.body as any;
            const friendList = body.data;
            this.contacts = friendList.map((friend: any) => ({
              id: friend._id,
              name: friend.name,
              avatar: friend.picUrl,
              lastMessage: friend.lastMessage && friend.lastMessage.length > 0 ? friend.lastMessage : 'Start a conversation',
              lastActive: this.getRelativeTime(friend.lastMessageTime)
            }));

            this.threads = this.contacts.map(contact => ({
              contactId: contact.id,
              messages: [],
              currentPage: 1,
              hasMore: true
            }));

            if (this.contacts.length > 0) {
              this.selectedContactId = this.contacts[0].id;
              this.getMessage(this.selectedContactId, 1, true);
            }
          }
          this.cdr.detectChanges();
        },
        error: (error) => console.error('error:', error)
      });
  }

  private getRelativeTime(isoString: string): string {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 604800)}w ago`;
  }

  private getMessage(contactId: string, page: number, scrollToBottom = false): void {
    const params = {
      user1Id: this.userId,
      user2Id: contactId,
      page: page.toString(),
      limit: '20'
    };

    this.http.get(`${environment.apiUrl}/message`, { params: params, observe: 'response' })
      .subscribe({
        next: (response) => {
          if (response.status === 200) {
            const body = response.body as any;
            const messagesData = body.data || [];
            const validMessages = messagesData.filter((msg: any) => msg.content?.trim().length > 0);
            const chatMessages: ChatMessage[] = validMessages.map((msg: any) => ({
              id: msg._id,
              from: msg.senderId === this.userId ? 'me' : 'them',
              text: msg.content.trim(),
              timestamp: this.formatTime(msg.createdAt)
            }));

            let thread = this.threads.find(t => t.contactId === contactId);
            if (!thread) {
              thread = { contactId, messages: [], currentPage: 1, hasMore: true };
              this.threads.push(thread);
            }

            if (page === 1) {
              thread.messages = chatMessages;
            } else {
              thread.messages = [...chatMessages, ...thread.messages];
            }

            thread.currentPage = page;
            thread.hasMore = chatMessages.length > 0;

            this.cdr.detectChanges();

            if (scrollToBottom) {
              setTimeout(() => this.scrollToBottom(), 0);
            }
          }
        },
        error: (error) => console.error('error:', error)
      });
  }

  private formatTime(isoString: string): string {
    const date = isoString ? new Date(isoString) : new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d} ${h}:${min}`;
  }

  protected selectContact(contactId: string): void {
    this.selectedContactId = contactId;
    this.draftMessage = '';
    this.isInitialLoad = true;
    this.getMessage(contactId, 1, true);
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: any) {
    const element = event.target;
    if (element.scrollTop === 0) {
      const thread = this.threads.find(t => t.contactId === this.selectedContactId);
      if (thread && thread.hasMore) {
        const prevHeight = element.scrollHeight;
        this.getMessage(this.selectedContactId, thread.currentPage + 1);
        setTimeout(() => {
          const newHeight = element.scrollHeight;
          element.scrollTop = newHeight - prevHeight;
        }, 200);
      }
    }
  }

  private scrollToBottom(): void {
    const el = this.chatMessagesContainer?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }

  protected messagesForSelected(): ChatMessage[] {
    const contactId = this.selectedContactId;
    return this.threads.find(t => t.contactId === contactId)?.messages ?? [];
  }

  protected selectedContact(): ChatContact | undefined {
    return this.contacts.find(c => c.id === this.selectedContactId);
  }

  protected sendMessage(): void {
    const text = this.draftMessage.trim();
    if (!text) return;
    const contactId = this.selectedContactId;
    let thread = this.threads.find(t => t.contactId === contactId);
    if (!thread) {
      thread = { contactId, messages: [], currentPage: 1, hasMore: true };
      this.threads.push(thread);
    }
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      from: 'me',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    thread.messages = [...thread.messages, newMessage];
    const contact = this.contacts.find(c => c.id === contactId);
    if (contact) {
      contact.lastMessage = text;
      contact.lastActive = 'Just now';
    }
    this.draftMessage = '';
    this.scrollToBottom();
    const body = { senderId: this.userId, receiverId: contactId, content: text };
    this.http.post(`${environment.apiUrl}/message`, body, { observe: 'response' })
      .subscribe({ error: (err) => console.error('Send message error:', err) });
  }

  protected goToMatch(): void {
    void this.router.navigate(['/match']);
  }
}