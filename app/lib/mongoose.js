import mongoose from "mongoose";

const connectionToDataBase = async () => {
  try {
    await mongoose.connect(process.env.MongoURL);
    console.log("Conected to db");
  } catch (err) {
    console.log(err);
  }
};

export default connectionToDataBase;
