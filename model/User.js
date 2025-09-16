const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },    
    email:{
        type: String,
        required: true
    },   
    password: {
        type: String,
        required:true
    },
    rol: {
        type: String,
        required:true
    }
});
const User = mongoose.model('user', userSchema);

// Middleware para eliminar cursa asociados al usuario
userSchema.pre("findOneAndDelete", async function (next) {
  const userId = this.getQuery()["_id"];
  await mongoose.model("cursa").deleteMany({ usuario: userId });
  next();
})

module.exports = User;