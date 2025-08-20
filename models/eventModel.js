import mongoose from "mongoose";

// Event schema
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add validation to ensure end date is after start date
eventSchema.pre("validate", function (next) {
  if (this.start && this.end && this.start >= this.end) {
    const error = new Error("End date must be after start date");
    error.name = "ValidationError";
    return next(error);
  }
  next();
});

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);

export default Event;
