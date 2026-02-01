import mongoose from "mongoose";

const Messages = mongoose.Schema({
  Sender: {
    type: String,
    required: (true, "missing sender detail"),
  },
  Group: {
    type: String,
    required: (true, "missing Group detail"),
  },
  Message: {
    type: String,
    required: (true, "missing message to be saved"),
  },
});

const messageS = mongoose.model("Message", Messages);

export default messageS;
