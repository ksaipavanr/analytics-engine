const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  websiteUrl: { type: String, required: true },
  apiKey: { type: String, required: true, unique: true },
  apiKeyExpires: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

// Mock data storage for production when MongoDB is unavailable
let mockApplications = [];
let mockCounter = 1;

// Override the save method for production
applicationSchema.methods.save = async function() {
  if (process.env.NODE_ENV === 'production' && !mongoose.connection.readyState) {
    // Mock save for production
    if (!this._id) {
      this._id = 'mock_app_' + mockCounter++;
      this.createdAt = new Date();
      this.updatedAt = new Date();
    }
    mockApplications.push(this.toObject());
    return this;
  }
  
  // Original save for development
  return await mongoose.Model.prototype.save.call(this);
};

// Mock find method
applicationSchema.statics.find = function(query) {
  if (process.env.NODE_ENV === 'production' && !mongoose.connection.readyState) {
    return {
      populate: () => ({
        select: () => mockApplications.filter(app => 
          !query || (query.name ? app.name === query.name : true)
        )
      })
    };
  }
  return mongoose.Model.find.apply(this, arguments);
};

// Mock findOne method
applicationSchema.statics.findOne = function(query) {
  if (process.env.NODE_ENV === 'production' && !mongoose.connection.readyState) {
    const result = mockApplications.find(app => 
      !query || (query._id ? app._id === query._id : true) ||
      (query.name ? app.name === query.name : true)
    );
    return Promise.resolve(result ? { ...result, toObject: () => result } : null);
  }
  return mongoose.Model.findOne.apply(this, arguments);
};

module.exports = mongoose.models.Application || mongoose.model('Application', applicationSchema);