import * as TYPES from '../constants/action-types';

const initialState = {
  timePeriod: 'present'
};

function rootReducer(state = initialState, { type, payload }) {
  switch (type) {
    case TYPES.SET_TIME_PERIOD :
      return {
        ...state,
        timePeriod: payload
      };

    default :
      return initialState;
  }
}


export default rootReducer;
