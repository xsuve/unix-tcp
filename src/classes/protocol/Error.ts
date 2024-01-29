export enum ErrorCode {
  INVALID_PASSWORD_ERROR = 0,
  INVALID_OPPONENT_ERROR = 1,
  OPPONENT_UNAVAILABLE_ERROR = 2,
  NO_OPPONENTS_AVAILABLE = 3,
  PLAYER_GUESSED_WORD = 4,
  YOU_GUESSED_WORD = 5,
  OPPONENT_GAVE_UP = 6,
  YOU_GAVE_UP = 7,
}

export const Errors = {
  '0': 'You entered the wrong password.',
  '1': 'You chose an invalid opponent ID.',
  '2': 'The opponent you chose is unavailable.',
  '3': 'There are no opponents available.',
  '4': 'Player guessed the word.',
  '5': 'You guessed the word.',
  '6': 'Opponent gave up.',
  '7': 'You gave up.',
};
