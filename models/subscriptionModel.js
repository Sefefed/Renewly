import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
     name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name must be at most 100 characters long']
     },
     price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a positive number'],
     },
     currency: {
      type: String,
      required: [true, 'Currency is required'],
      enum: {
        values: ['USD', 'EUR', 'GBP', 'BIRR'],
        message: '{VALUE} is not a valid currency'
      },
      default: 'USD'
     },
     frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
     },
     category: {
      type: String,
      enum: ['sports', 'news', 'entertainment', 'education'],
      required: [true, 'Category is required']
     },
     paymentMethod: {
      type: String,
      required: true,
      trim: true
     },
     status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled'],
      default: 'active'
     },
     startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      validate: {
        validator: (value) => {
          return value <= new Date();
        },
        message: 'Start date must be in the past'
      }

     },
     renewalDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return this.startDate < value;
        },
        message: 'Renewal date must be after start date'
      }

     },
     user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true
     }
}, {
  timestamps: true
});

//Auto calculate the renewal date if missing

subscriptionSchema.pre('save', function(next) {
  if(!this.renewalDate) {
    const renewalPeriods = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      yearly: 365
    };

         this.renewalDate = new Date(this.startDate);
         this.renewalDate.setDate(this.renewalDate.getDate() + renewalPeriods[this.frequency]);
  }

  //auto set the status if the renewal date is in the past
       if(this.renewalDate < new Date()) {
         this.status = 'inactive';
       }
  next();
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;

