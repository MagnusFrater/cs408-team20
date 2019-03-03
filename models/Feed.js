const regex = require('../tools/regex');

// returns a user's public feed
async function getPublic(db) {
    if (!regex.validateDatabase(db)) {
        return {
            code: 500,
            data: regex.getInvalidDatabaseResponse(db)
        };
    }

    const result1 = await db('polls')
        .where({
            scope: 'public',
            state: 'active'
        })
        .select('id', 'display_name', 'theme', 'creator', 'opponent', 'image_1', 'image_2', 'votes_1', 'votes_2', 'state', 'type', 'duration', 'scope', 'start_time', 'end_time')
        .catch(e => {
            return {
                code: 500,
                data: e.originalStack
            };
        });

    if (!!result1.code) {
        return result1;
    }

    // no polls, no need to do more work
    if (result1.length < 1) {
        return {
            code: 200,
            data: []
        };
    }

    const polls = result1;
    const result2 = await addPollsHistory(db, polls);
    if (!!result2.code) {
        return result2;
    }

    return {
        code: 200,
        data: polls
    };
}

// returns a user's private feed
async function getPrivate(db, username) {
    if (!regex.validateDatabase(db)) {
        return {
            code: 500,
            data: regex.getInvalidDatabaseResponse(db)
        };
    }

    if (!regex.validateUsername(username)) {
        return {
            code: 400,
            data: regex.getInvalidUsernameResponse(username)
        };
    }

    // get a list of this user's friends by their username
    const friends = await require('./Friend').get(db, username);
    
    // no friends, so no polls
    if (friends.data.length < 1) {
        return {
            code: 200,
            data: []
        };
    }

    const friendUsernames = friends.data.map(f => f.username);
    friendUsernames.push(username);

    const result1 = await db('polls')
        .where((builder) => {
            builder.
                whereIn('creator', friendUsernames)
                .orWhereIn('opponent', friendUsernames)
        })
        .andWhere({
            scope: 'private',
            state: 'active'
        })
        .select('id', 'display_name', 'theme', 'creator', 'opponent', 'image_1', 'image_2', 'votes_1', 'votes_2', 'state', 'type', 'duration', 'scope', 'start_time', 'end_time')
        .catch(e => {
            return {
                code: 500,
                data: e.originalStack
            };
        });

    if (!!result1.code) {
        return result1;
    }

    // no polls, no need to do more work
    if (result1.length < 1) {
        return {
            code: 200,
            data: []
        };
    }

    const polls = result1;
    const result2 = await addPollsHistory(db, polls);
    if (!!result2.code) {
        return result2;
    }

    return {
        code: 200,
        data: polls
    };
}

async function addPollsHistory(db, polls) {
    // no polls to add history to
    if (polls.length < 1) {
        return {};
    }

    const pollIds = polls.map(poll => poll.id);
    const result = await db('history')
        .whereIn('poll', pollIds)
        .select()
        .catch(e => {
            return {
                code: 500,
                data: e.originalStack
            };
        });

    if (!!result.code) {
        return result;
    }

    // cycle through the vote history
    for (let i=0; i<result.length; i++) {
        // cycle through the polls
        for (let j=0; j<polls.length; j++) {
            // if the vote's poll id matches the current poll id,
            if (result[i].poll === polls[j].id) {
                // set the poll's 'voted' pair
                polls[j].voted = result[i].vote;
                break;
            }
        }
    }

    return {};
}


module.exports = {
    getPublic, getPrivate
}
