import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  color: {
    type: String,
    default: 'blue',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Event || mongoose.model('Event', EventSchema);