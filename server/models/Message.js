const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'file'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    name: String,
    size: Number
  }],
  reactions: [{
    emoji: {
      type: String,
      required: true
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient querying
messageSchema.index({ channel: 1, createdAt: -1 });
messageSchema.index({ author: 1, createdAt: -1 });

// Method to get public message data
messageSchema.methods.getPublicMessage = async function() {
  await this.populate('author', 'username avatar status');
  return {
    id: this._id,
    content: this.content,
    author: this.author.getPublicProfile(),
    channel: this.channel,
    attachments: this.attachments,
    reactions: this.reactions,
    mentions: this.mentions,
    edited: this.edited,
    editedAt: this.editedAt,
    deleted: this.deleted,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message; 