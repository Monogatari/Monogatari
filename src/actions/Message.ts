import Action from './../lib/Action';
import { FancyError } from './../lib/FancyError';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';


export class Message extends Action {
  static override id = 'Message';
  static override blocking = false;

  static _configuration: any = {
    messages: {}
  };

  static override async bind(): Promise<void> {
    // The close action removes the active class from the element it
    // points to.
    this.engine.on('click', '[data-component="message-modal"] [data-action="close"]', () => {
      Message.blocking = false;
      this.engine.element().find('[data-component="message-modal"]').remove();
      this.engine.proceed({ userInitiated: true, skip: false, autoPlay: false });
    });
  }

  static override async shouldProceed(_options?: { userInitiated?: boolean; skip?: boolean; autoPlay?: boolean; }): Promise<void> {
    if (Message.blocking) {
      throw new Error('Message waiting for dismissal');
    }
  }

  static override async willRollback(): Promise<void> {
    Message.blocking = false;
  }

  static override matchString([show, type]: string[]): boolean {
    return show === 'show' && type === 'message';
  }

  static messages(object: any = null): any {
    if (object !== null) {
      if (typeof object === 'string') {
        return Message._configuration.messages[object];
      } else {
        Message._configuration.messages = Object.assign({}, Message._configuration.messages, object);
      }
    } else {
      return Message._configuration.messages;
    }
  }

  id: string;
  message: any;
  classes: string[];

  constructor([show, type, message, ...classes]: string[]) {
    super();
    this.id = message;
    this.message = (this.constructor as any).messages(message);
    this.classes = classes;
  }

  override async willApply(): Promise<void> {
    if (typeof this.message !== 'undefined') {
      // Check if the old format is being use and translate it to the new one
      if (this.message.Title && this.message.Subtitle && this.message.Message) {
        this.message.title = this.message.Title;
        this.message.subtitle = this.message.Subtitle;
        this.message.body = this.message.Message;
      }
      return Promise.resolve();
    } else {
      FancyError.show('action:message:not_found', {
        id: this.id,
        availableMessages: Object.keys(Message.messages()),
        label: this.engine.state('label'),
        step: this.engine.state('step')
      });
    }

    return Promise.reject();
  }

  override async apply(): Promise<void> {
    Message.blocking = true;

    const element = document.createElement('message-modal');

    if (typeof this.message.title === 'string') {
      (element as any).setProps({
        title: this.engine.replaceVariables(this.message.title)
      });
    }

    if (typeof this.message.subtitle === 'string') {
      (element as any).setProps({
        subtitle: this.engine.replaceVariables(this.message.subtitle)
      });
    }

    if (typeof this.message.body === 'string') {
      (element as any).setProps({
        body: this.engine.replaceVariables(this.message.body)
      });
    }

    if (typeof this.message.actionString === 'string') {
      (element as any).setProps({
        actionString: this.engine.replaceVariables(this.message.actionString)
      });
    }

    for (const newClass of this.classes) {
      if (newClass) {
        element.classList.add(newClass);
      }
    }

    this.engine.element().find('[data-screen="game"]').append(element);
  }

  override async revert(): Promise<void> {
    const messageModal = this.engine.component('message-modal') as { instances?: () => { remove: () => void } } | undefined;
    if (messageModal?.instances) {
      messageModal.instances().remove();
    }
    return this.apply();
  }

  override async didRevert(): Promise<ActionRevertResult> {
    return { advance: false, step: true };
  }
}

export default Message;