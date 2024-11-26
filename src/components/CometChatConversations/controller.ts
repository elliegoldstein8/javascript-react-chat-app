import { CometChat } from '@cometchat/chat-sdk-javascript';
import { CometChatUIKit } from "../../CometChatUIKit/CometChatUIKit";
import { CometChatUIKitConstants } from "../../constants/CometChatUIKitConstants";

type Args = {
    conversationsRequestBuilder: CometChat.ConversationsRequestBuilder | null
};

export class ConversationsManager {
    private static limit = 30;
    private conversationsRequest: CometChat.ConversationsRequest;
    private static conversationType: string | undefined = undefined;

    /**
     * Set `conversationsRequest` of the instance
     */
    constructor(args: Args) {
        const {
            conversationsRequestBuilder
        } = args;
        const convRequestBuilder = conversationsRequestBuilder || new CometChat.ConversationsRequestBuilder().setLimit(ConversationsManager.limit);
        this.conversationsRequest = convRequestBuilder.build();
        if (conversationsRequestBuilder) {
            ConversationsManager.conversationType = conversationsRequestBuilder
                .build()
                .getConversationType();
        }
    }

    /**
     * Calls `fetchNext` method of the set `conversationsRequest`
     */
    fetchNext() {
        return this.conversationsRequest.fetchNext();
    }

    /**
     * Attaches an SDK user listener
     *
     * @returns Function to call to remove the attached SDK user listener
     */
    static attachUserListener(callback: (user: CometChat.User) => void) {
        const listenerId = "ConversationList_User_" + String(Date.now());
        CometChat.addUserListener(
            listenerId,
            new CometChat.UserListener({
                onUserOnline: callback,
                onUserOffline: callback
            })
        );
        return () => CometChat.removeUserListener(listenerId);
    }

    /**
     * Attaches an SDK group listener
     *
     * @returns Function to call to remove the attached SDK group listener
     */
    static attachGroupListener(callback: (message: CometChat.BaseMessage, remove?: boolean) => Promise<void>, loggedInUser: CometChat.User | null) {
        const listenerId = "ConversationList_Group_" + String(Date.now());
        CometChat.addGroupListener(
            listenerId,
            new CometChat.GroupListener({
                onGroupMemberJoined: (message: CometChat.Action) => {
                    callback(message);
                },
                onGroupMemberLeft: (message: CometChat.Action, leavingUser: CometChat.User) => {
                    if (loggedInUser?.getUid() === leavingUser.getUid()) {
                        callback(message, true);
                    }
                    else {
                        callback(message);
                    }
                },
                onGroupMemberKicked: (message: CometChat.Action, kickedUser: CometChat.User) => {
                    if (loggedInUser?.getUid() === kickedUser.getUid()) {
                        callback(message, true);
                    }
                    else {
                        callback(message);
                    }
                },
                onGroupMemberBanned: (message: CometChat.Action, bannedUser: CometChat.User) => {
                    if (loggedInUser?.getUid() === bannedUser.getUid()) {
                        callback(message, true);
                    }
                    else {
                        callback(message);
                    }
                },
                onGroupMemberUnbanned: (message: CometChat.Action) => {
                    callback(message);
                },
                onMemberAddedToGroup: (message: CometChat.Action) => {
                    callback(message);
                },
                onGroupMemberScopeChanged: (message: CometChat.Action) => {
                    callback(message);
                }
            })
        );
        return () => CometChat.removeGroupListener(listenerId);
    }

    /**
     * Attaches an SDK message received listener
     *
     * @returns - Function to remove the added SDK message received listener
     */
    static attachMessageReceivedListener(callback: (message: CometChat.BaseMessage) => Promise<void>) {
        const messageListenerId: string = "message_" + new Date().getTime();

        CometChat.addMessageListener(messageListenerId, new CometChat.MessageListener({
            onTextMessageReceived: (textMessage: CometChat.TextMessage) => {
                callback(textMessage);
            },
            onMediaMessageReceived: (mediaMessage: CometChat.MediaMessage) => {
                callback(mediaMessage);
            },
    
            onCustomMessageReceived: (customMessage: CometChat.CustomMessage) => {
                callback(customMessage);
            }
            
          }))
        return () => {
            CometChat.removeMessageListener(messageListenerId)
        };
    }

    /**
     * Attaches an SDK message receipt listener
     *
     * @returns - Function to remove the added SDK message receipt listener
     */
    static attachMessageReceiptListener(callback: (receipt: CometChat.MessageReceipt, updateReadAt: boolean) => void) {
        const messageListenerId: string = "message-receipt_" + new Date().getTime();


        CometChat.addMessageListener(messageListenerId, new CometChat.MessageListener({
            onMessagesRead: (messageReceipt: CometChat.MessageReceipt) => {
                callback(messageReceipt, true);
            },
            onMessagesDelivered: (messageReceipt: CometChat.MessageReceipt) => {
                callback(messageReceipt, false);
            },
            onMessagesDeliveredToAll: (messageReceipt: CometChat.MessageReceipt) => {
                callback(messageReceipt, false);

            },
            onMessagesReadByAll: (messageReceipt: CometChat.MessageReceipt) => {
                callback(messageReceipt, true);

            },
            onMediaMessageReceived: (messageReceipt: CometChat.MessageReceipt) => {
                callback(messageReceipt, false);;
            },
    
          }))

        return () => {
            CometChat.removeMessageListener(messageListenerId)
        };
    }

    /**
     * Attaches an SDK message typing listener
     *
     * @returns - Function to remove the added SDK message typing listener
     */
    static attachMessageTypingListener(callback: (typingIndicator: CometChat.TypingIndicator, typingStarted: boolean) => void) {
        const messageListenerId: string = "typing_" + new Date().getTime();

        CometChat.addMessageListener(messageListenerId, new CometChat.MessageListener({
            onTypingStarted: (typingIndicator: CometChat.TypingIndicator) => {
                callback(typingIndicator, true);
            },
            onTypingEnded: (typingIndicator: CometChat.TypingIndicator) => {
                callback(typingIndicator, false);
            },
        }))
   
        return () => {
            CometChat.removeMessageListener(messageListenerId)
        };
    }

    /**
     * Attaches an SDK message modified listener
     *
     * @returns - Function to remove the added SDK message modified listener
     */
    static attachMessageModifiedListener(callback: (message: CometChat.BaseMessage) => void) {

        const messageListenerId: string = "delete_" + new Date().getTime();

        CometChat.addMessageListener(messageListenerId, new CometChat.MessageListener({
            onMessageEdited: (message: CometChat.BaseMessage) => {
                callback(message);
            },
            onMessageDeleted: (message: CometChat.BaseMessage) => {
                callback(message);
            },
        }))
       
        return () => {
            CometChat.removeMessageListener(messageListenerId)
        };
    }

    /**
     * Attaches an SDK call listener
     *
     * @returns - Function to remove the added SDK call listener
     */
    static attachCallListener(callback: (message: CometChat.BaseMessage) => void) {
        const listenerId = "ConversationList_Call_" + String(Date.now());
        CometChat.addCallListener(
            listenerId,
            new CometChat.CallListener({
                onIncomingCallReceived: callback,
                onOutgoingCallAccepted: callback,
                onOutgoingCallRejected: callback,
                onIncomingCallCancelled: callback
            })
        );
        return () => CometChat.removeCallListener(listenerId);
    }
    /**
  * Attaches an SDK websocket  listener
  *
  * @returns - Function to remove the added SDK websocket listener
  */
    static attachConnestionListener(callback: () => void) {
        const listenerId = "ConversationList_connection_" + String(Date.now());
        CometChat.addConnectionListener(
            listenerId,
            new CometChat.ConnectionListener({
                onConnected: () => {
                    console.log("ConnectionListener =>connected");
                    if (callback) {
                        callback()
                    }
                },
                onDisconnected: () => {
                    console.log("ConnectionListener => On Disconnected");
                }
            })
        );
        return () => CometChat.removeConnectionListener(listenerId);
    }

    /**
     * Determines if the last message should trigger an update based on its category and type.
     *
     * @param message - The last message sent or received in the conversation.
     * @returns {boolean} - Returns true if the message should trigger an update, false otherwise.
     */

    static shouldLastMessageAndUnreadCountBeUpdated = (message: CometChat.BaseMessage) => {

        // Checking if the message is a custom message
        let isCustomMessage = message?.getCategory() === CometChatUIKitConstants.MessageCategory.custom
        // Check if the message is a reply to another message
        if (message?.getParentMessageId() && !CometChatUIKit.conversationUpdateSettings?.shouldUpdateOnMessageReplies()) {
            return false;
        }
        if (isCustomMessage) {
            if (message?.getParentMessageId() && CometChatUIKit.conversationUpdateSettings?.shouldUpdateOnMessageReplies() && this.shouldIncrementForCustomMessage(message as CometChat.CustomMessage)) {
                return true
            }
            return this.shouldIncrementForCustomMessage(message as CometChat.CustomMessage);
        }
        // Check if the message is an action message
        if (message?.getCategory() === CometChatUIKitConstants.MessageCategory.action) {
            // Check if the message is a group member action
            if (message?.getType() === CometChatUIKitConstants.MessageTypes.groupMember) {
                return CometChatUIKit.conversationUpdateSettings?.shouldUpdateOnGroupActions();
            }
            // By default, action messages should trigger an update
            return true
        }
        // Check if the message is a call (either audio or video)
        if (message?.getCategory() === CometChatUIKitConstants.MessageCategory.call &&
            (message?.getType() === CometChatUIKitConstants.MessageTypes.audio ||
                message?.getType() === CometChatUIKitConstants.MessageTypes.video)) {
            return CometChatUIKit.conversationUpdateSettings?.shouldUpdateOnCallActivities();
        }
        // By default, messages should trigger an update
        return true;
    }

    static shouldIncrementForCustomMessage(message: CometChat.CustomMessage) {
        const metadata: any = message?.getMetadata();
        // Checking if the custom message should increment the unread message counter
        return message?.willUpdateConversation()
            || (metadata && metadata.hasOwnProperty("incrementUnreadCount") && metadata.incrementUnreadCount) || CometChatUIKit.conversationUpdateSettings?.shouldUpdateOnCustomMessages();
    }


}
