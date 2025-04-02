const { 
    findUsers,
    addFriend,
    showFriendreq,
    acceptFriend,
    rejectFriend,
    displayFriend,
    removeFriend
} = require("../config/db_fun");

const Get_Users = async (req,res) => {
    const userid= req.user.userId;
    try {
        const data = await findUsers(userid);
        console.log(`users fetched by ${userid}`)
        return res.status(200).json(data);
    } 
    catch (error) {
        console.error(`Error fetching users for ${userid}:`, error);
        res.status(500).json({
            message: "Error fetching users",
            error: error.message 
        });
    }
};

const Send_FriendReq = async (req,res) => {
    const user1id=req.user.userId;
    const user2id=req.body.userId;
    try {
        await addFriend(user1id,user2id);
        console.log(`${user1id} sent friend req to ${user2id}`);
        res.status(200).json({
            message: `Friend req sent to ${user2id}`,
        });
    }
    catch(err){
        console.error(`Error sending req from user ${user1id} to user ${user2id}`, err);
        res.status(500).json({
            message: `Error in sending friend req to ${user2id}`,
            error: err.message
        });
    }
}

const Show_FriendReq = async(req,res) => {
    const userid=req.user.userId;
    try {
        const data = await showFriendreq(userid);
        console.log(`Friend Req fetched for used : ${userid}`)
        return res.status(200).json(data);
    } 
    catch(err){
        console.error(`Error fetching friend reqs for user ${userid}`, err);
        res.status(500).json({
            message: `Error in fetching friend req`,
            error: err.message
        });
    }  
}

const Accept_FriendReq = async(req,res) => {
    const user1id= req.user.userId;
    const user2id=req.body.userId;
    try {
        await acceptFriend(user1id,user2id);
        console.log(`Friend req accepted by ${user1id} for ${user2id}`)
        return res.status(200).json({
            message:`Friend Request accepted for ${user2id}`
        });
    } 
    catch(err){
        console.error(`Error accepting Friend Req by ${user1id} for ${user2id}`, err);
        res.status(500).json({
            message: `Error accepting Friend req for ${user2id}`,
            error: err.message
        });
    }      
}

const Reject_FriendReq = async(req,res) => {
    const user1id= req.user.userId;
    const user2id=req.body.userId;
    try {
        await rejectFriend(user1id,user2id);
        console.log(`Friend req declined by ${user1id} for ${user2id}`)
        return res.status(200).json({
            message:`Friend Request declined for ${user2id}`
        });
    } 
    catch(err){
        console.error(`Error decling FriendReq by ${user1id} for ${user2id}`, err);
        res.status(500).json({
            message: `Error declining Friend request for ${user2id}`,
            error: err.message
        });
    }      
}

const Fetch_Friends = async(req,res) => {
    const userid= req.user.userId;
    try {
        const data = await displayFriend(userid);
        console.log(`Friends fetched by ${userid}`)
        return res.status(200).json(data);
    } 
    catch (error) {
        console.error(`Error fetching friends for ${userid}:`, error);
        res.status(500).json({
            message: "Error fetching friends",
            error: error.message 
        });
    }
}

const Remove_Friend = async(req,res) => {
    const user1id= req.user.userId;
    const user2id=req.body.userId;
    try {
        await removeFriend(user1id,user2id);
        console.log(`Friends removed by ${user1id} for ${user2id}`)
        return res.status(200).json({
            message:`Removed ${user2id} from friends`
        });
    } 
    catch(err){
        console.error(`Error removing Friends by ${user1id} for ${user2id}`, err);
        res.status(500).json({
            message: `Error Removed ${user2id} from friends`,
            error: err.message
        });
    }  
}


module.exports = { 
    Get_Users,
    Send_FriendReq,
    Show_FriendReq,
    Accept_FriendReq,
    Reject_FriendReq,
    Fetch_Friends,
    Remove_Friend,
}