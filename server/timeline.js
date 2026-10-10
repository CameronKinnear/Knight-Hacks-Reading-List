const timeline = [
    'Captain America: The First Avenger', 'Captain Marvel', 'Iron Man', 'Iron Man 2',
    'The Incredible Hulk', 'Thor', 'The Avengers', 'Thor: The Dark World', 'Iron Man 3',
    'Captain America: The Winter Soldier', 'Guardians of the Galaxy', 'Guardians of the Galaxy Vol. 2',
    'Avengers: Age of Ultron', 'Ant-Man', 'Captain America: Civil War', 'Black Widow', 'Black Panther',
    'Spider-Man: Homecoming', 'Doctor Strange', 'Thor: Ragnarok', 'Ant-Man and the Wasp',
    'Avengers: Infinity War', 'Avengers: Endgame', 'Spider-Man: Far From Home', 'Eternals',
    'Shang-Chi and the Legend of the Ten Rings', 'Spider-Man: No Way Home',
    'Doctor Strange in the Multiverse of Madness', 'Thor: Love and Thunder', 'Black Panther: Wakanda Forever',
    'Ant-Man and the Wasp: Quantumania', 'Guardians of the Galaxy Vol. 3', 'The Marvels',
    'Deadpool & Wolverine', 'Captain America: Brave New World', 'Thunderbolts*',
    'The Fantastic Four: First Steps', 'Avengers: Doomsday'
];

const titleAliases = {
    [NormalizeTitle('The Fantastic Four: First Steps')]: NormalizeTitle('The Fantastic 4: First Steps')
};

/*
Normalizes a movie title for punctuation-insensitive matching.
:title - Title to normalize
:returns - Lowercase letters and numbers only
*/
function NormalizeTitle(title) {
    return title.toLowerCase().replace(/[^a-z0-9]/g, '');
}

module.exports = { timeline, titleAliases, NormalizeTitle };
