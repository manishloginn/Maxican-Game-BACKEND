const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userSchema = require('./models/userSchema');
const app = express();

app.use(express.json());
app.use(cors());



mongoose.connect('mongodb+srv://manish:12345@cluster0.vng14.mongodb.net/lotteryGame')
    .then(() => {
        console.log('mongodb connected')
    })




const numbers = [...Array(9).keys()].map(n => n + 1); // [1, 2, ..., 9]

function getRandomNumber() {
    if (numbers.length === 0) {
        throw new Error('All numbers have been used!');
    }

    const randomIndex = Math.floor(Math.random() * numbers.length);
    return numbers.splice(randomIndex, 1)[0]; // Remove and return the number
}







app.post('/createUsers', async (req, res) => {

    const { users } = req.body;


    let gridLayout = []
    let booleanGrid = [];
    try {
        for (let i = 0; i < 3; i++) {
            const row = [];
            let boolRow = [];
            for (let j = 0; j < 3; j++) {
                row.push(getRandomNumber());
                boolRow.push(false);
            }
            gridLayout.push(row);
            booleanGrid.push(boolRow)
        }
        const newUser = new userSchema({
            username: users,
            grid: gridLayout,
            markedNumbers: booleanGrid,
            winner:false
        })

        // console.log(newUser)

        newUser.save()
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Error creating users' });
    }
});


app.put('/cutNumber/:username/:number', async (req, res) => {
    const { username, number } = req.params;

    console.log(username, number)

    try {
        const user = await userSchema.findOne({ username });
        console.log(user)
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!Array.isArray(user.grid) || !Array.isArray(user.markedNumbers)) {
            return res.status(400).json({ message: 'Grid or markedNumbers is not properly initialized' });
        }
        let numberFound = false;
        user.grid.forEach((row, i) => {
            row.forEach((num, j) => {
                if (num === parseInt(number)) {
                    user.markedNumbers[i][j] = true;
                    numberFound = true;
                }
            });
        });


        if (!numberFound) {
            return res.status(404).json({ message: 'Number not found in the grid' });
        }

        await user.save();

        if (checkWin(user.markedNumbers)) {
            user.winner = true;
            await user.save();
            return res.status(200).json({ message: `${username} wins!` });
        }

        res.status(200).json({ message: 'Number cut successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating grid' });
    }
});



const checkWin = (markedNumbers) => {
    for (let row of markedNumbers) {
        if (row.every((cell) => cell)) return true;
    }
    for (let col = 0; col < 3; col++) {
        if (markedNumbers[0][col] && markedNumbers[1][col] && markedNumbers[2][col]) {
            return true;
        }
    }

    return false;
};




app.listen(6000, () => {
    console.log('running on 6000 ')
})