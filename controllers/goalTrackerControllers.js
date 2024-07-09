const connection = require('../config/db'); // Import the connection

// Controller to get all goals
const getGoals = (req, res) => {
  connection.query('SELECT * FROM goal_tracker', (error, results) => {
    if (error) {
      console.error('Error fetching goals:', error);
      return res.status(500).send('Server error');
    }
    res.json(results);
  });
};

// Controller to add a new goal
const addGoal = (req, res) => {
  const { name, amount, allocation } = req.body;
  if (!name || !amount || !allocation) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = 'INSERT INTO goal_tracker (name, amount, allocation) VALUES (?, ?, ?)';
  connection.query(query, [name, amount, allocation], (error, results) => {
    if (error) {
      console.error('Error adding goal:', error);
      return res.status(500).json({ error: 'Server error' });
    }
    res.json({ id: results.insertId, name, amount, allocation });
  });
};

// Controller to update the allocation of a goal
const updateGoalAllocation = (req, res) => {
  const { id } = req.params;
  const { allocation } = req.body;

  const amountToAdd = parseFloat(allocation);

  if (isNaN(amountToAdd) || amountToAdd < 0) {
    return res.status(400).json({ error: 'Invalid allocation amount' });
  }

  connection.query('SELECT allocation, amount FROM goal_tracker WHERE id = ?', [id], (fetchError, fetchResults) => {
    if (fetchError) {
      console.error('Error fetching goal:', fetchError);
      return res.status(500).send('Server error');
    }

    if (fetchResults.length === 0) {
      return res.status(404).send('Goal not found');
    }

    const currentAllocation = parseFloat(fetchResults[0].allocation);
    const goalAmount = parseFloat(fetchResults[0].amount);

    // Calculate new allocation
    const newAllocation = currentAllocation + amountToAdd;

    // Check if new allocation exceeds the goal amount
    if (newAllocation > goalAmount) {
      return res.status(400).json({ error: 'Allocation exceeds the goal amount' });
    }

    const achieved = newAllocation >= goalAmount;

    const updateQuery = 'UPDATE goal_tracker SET allocation = ?, achieved = ? WHERE id = ?';
    connection.query(updateQuery, [newAllocation, achieved, id], (updateError) => {
      if (updateError) {
        console.error('Error updating goal allocation:', updateError);
        return res.status(500).send('Server error');
      }

      res.json({ id, allocation: newAllocation, achieved });
    });
  });
};

// Controller to delete a goal
const deleteGoal = (req, res) => {
  const { id } = req.params;

  const deleteQuery = 'DELETE FROM goal_tracker WHERE id = ?';
  connection.query(deleteQuery, [id], (error, results) => {
    if (error) {
      console.error('Error deleting goal:', error);
      return res.status(500).send('Server error');
    }

    if (results.affectedRows === 0) {
      return res.status(404).send('Goal not found');
    }

    res.json({ message: 'Goal deleted successfully' });
  });
};

module.exports = {
  getGoals,
  addGoal,
  updateGoalAllocation,
  deleteGoal,
};
