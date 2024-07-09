const connection = require('../config/db'); // Assuming MySQL connection is set up
const bcrypt = require('bcryptjs'); // Import bcryptjs for password hashing

// Controller function to fetch user profile data
const getProfile = async (req, res) => {
    try {
        const userId = req.userId; // Assuming userId is passed in the request params

        // Fetch user profile data from MySQL database
        connection.query('SELECT name, email, joinedDate FROM users WHERE userId = ?', [userId], (error, results) => {
            if (error) {
                console.error('Error fetching user profile:', error);
                return res.status(500).json({ message: 'Failed to fetch user profile' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            const { name, email, joinedDate } = results[0];

            res.json({
                name,
                email,
                joinedDate,
            });
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Failed to fetch user profile' });
    }
};

// Controller function to update user profile data (name)
const updateProfile = async (req, res) => {
    try {
        const userId = req.userId; // Assuming userId is passed in the request params
        const { name } = req.body; // Only name is sent in request body

        // Update user name in MySQL database
        connection.query('UPDATE users SET name = ? WHERE userId = ?', [name, userId], (error, results) => {
            if (error) {
                console.error('Error updating user profile:', error);
                return res.status(500).json({ message: 'Failed to update user profile' });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({ message: 'Profile updated successfully' });
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Failed to update user profile' });
    }
};

// Controller function to update user password
const updatePassword = async (req, res) => {
    try {
        const userId = req.userId; // Assuming userId is passed in the request params
        const { currentPassword, newPassword } = req.body; // Current password and new password sent in request body

        // Fetch current hashed password from MySQL database
        connection.query('SELECT password FROM users WHERE userId = ?', [userId], async (error, results) => {
            if (error) {
                console.error('Error fetching user password:', error);
                return res.status(500).json({ message: 'Failed to update password' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            const hashedPassword = results[0].password;

            // Compare currentPassword with hashedPassword
            const passwordMatch = await bcrypt.compare(currentPassword, hashedPassword);

            if (!passwordMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            // Hash the new password
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            // Update user password in MySQL database
            connection.query('UPDATE users SET password = ? WHERE userId = ?', [hashedNewPassword, userId], (error, results) => {
                if (error) {
                    console.error('Error updating user password:', error);
                    return res.status(500).json({ message: 'Failed to update password' });
                }

                res.json({ message: 'Password updated successfully' });
            });
        });
    } catch (error) {
        console.error('Error updating user password:', error);
        res.status(500).json({ message: 'Failed to update password' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    updatePassword,
};
