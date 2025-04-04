const { 
    findUsers,
    addFriend,
    showFriendreq,
    acceptFriend,
    rejectFriend,
    displayFriend,
    removeFriend
} = require("../config/db_fun");
const logger = require("../config/loki");

// Fetch users to make friends
const Get_Users = async (req, res) => {
    const userId = req.user.userId;
    try {
        const data = await findUsers(userId);
        logger.info(`User [${userId}] fetched user list.`);
        return res.status(200).json(data);
    } catch (error) {
        logger.error(`Error fetching users for [${userId}]: ${error.message}`);
        res.status(500).json({
            message: "Error fetching users",
            error: error.message 
        });
    }
};

// Send friend request
const Send_FriendReq = async (req, res) => {
    const user1id = req.user.userId;
    const user2id = req.body.userId;

    if (!user2id) {
        return res.status(400).json({ message: "Target userId is required." });
    }

    try {
        await addFriend(user1id, user2id);
        logger.info(`User [${user1id}] sent friend request to [${user2id}].`);
        res.status(200).json({ message: `Friend request sent to ${user2id}` });
    } catch (err) {
        logger.error(`Error sending friend request from [${user1id}] to [${user2id}]: ${err.message}`);
        res.status(500).json({
            message: `Error sending friend request to ${user2id}`,
            error: err.message
        });
    }
};

// Show pending friend requests
const Show_FriendReq = async (req, res) => {
    const userId = req.user.userId;
    try {
        const data = await showFriendreq(userId);
        logger.info(`Pending friend requests fetched for user [${userId}].`);
        return res.status(200).json(data);
    } catch (err) {
        logger.error(`Error fetching friend requests for [${userId}]: ${err.message}`);
        res.status(500).json({
            message: "Error fetching friend requests",
            error: err.message
        });
    }
};

// Accept friend request
const Accept_FriendReq = async (req, res) => {
    const user1id = req.user.userId;
    const user2id = req.body.userId;

    if (!user2id) {
        return res.status(400).json({ message: "Target userId is required." });
    }

    try {
        await acceptFriend(user1id, user2id);
        logger.info(`User [${user1id}] accepted friend request from [${user2id}].`);
        return res.status(200).json({ message: `Friend request accepted from ${user2id}` });
    } catch (err) {
        logger.error(`Error accepting friend request for [${user1id}] from [${user2id}]: ${err.message}`);
        res.status(500).json({
            message: `Error accepting friend request from ${user2id}`,
            error: err.message
        });
    }
};

// Reject friend request
const Reject_FriendReq = async (req, res) => {
    const user1id = req.user.userId;
    const user2id = req.body.userId;

    if (!user2id) {
        return res.status(400).json({ message: "Target userId is required." });
    }

    try {
        await rejectFriend(user1id, user2id);
        logger.info(`User [${user1id}] rejected friend request from [${user2id}].`);
        return res.status(200).json({ message: `Friend request rejected from ${user2id}` });
    } catch (err) {
        logger.error(`Error rejecting friend request for [${user1id}] from [${user2id}]: ${err.message}`);
        res.status(500).json({
            message: `Error rejecting friend request from ${user2id}`,
            error: err.message
        });
    }
};

// Get all friends
const Fetch_Friends = async (req, res) => {
    const userId = req.user.userId;
    try {
        const data = await displayFriend(userId);
        logger.info(`Friend list fetched by user [${userId}].`);
        return res.status(200).json(data);
    } catch (error) {
        logger.error(`Error fetching friends for [${userId}]: ${error.message}`);
        res.status(500).json({
            message: "Error fetching friends",
            error: error.message 
        });
    }
};

// Remove friend
const Remove_Friend = async (req, res) => {
    const user1id = req.user.userId;
    const user2id = req.body.userId;

    if (!user2id) {
        return res.status(400).json({ message: "Target userId is required." });
    }

    try {
        await removeFriend(user1id, user2id);
        logger.info(`User [${user1id}] removed friend [${user2id}].`);
        return res.status(200).json({ message: `Removed ${user2id} from friends` });
    } catch (err) {
        logger.error(`Error removing friend [${user2id}] for user [${user1id}]: ${err.message}`);
        res.status(500).json({
            message: `Error removing ${user2id} from friends`,
            error: err.message
        });
    }
};

module.exports = { 
    Get_Users,
    Send_FriendReq,
    Show_FriendReq,
    Accept_FriendReq,
    Reject_FriendReq,
    Fetch_Friends,
    Remove_Friend,
};
