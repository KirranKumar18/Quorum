import messageS from "../Models/Messages.js";
export const getChats = async (req, res) => {
  console.log("the id is ", req.params);
  try {
    const msg = await messageS.find({});
    res.status(200).json({ status: "✅", message: msg });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: "❌", error: "couldnt get the message " });
  }
};

export const postChat = async (req, res) => {
  try {
    const messageToBeSaved = await messageS.create(req.body);
    res.status(200).json({ status: "✅", message: messageToBeSaved });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: "❌", error: "couldnt save the mesage " });
  }
};
