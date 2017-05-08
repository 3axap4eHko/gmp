
import * as colors from 'material-ui/styles/colors';
import {fade} from 'material-ui/utils/colorManipulator';
import spacing from 'material-ui/styles/spacing';

export default {
    spacing,
    fontFamily: 'Roboto, sans-serif',
    palette: {
        primary1Color: colors.indigo500,
        primary2Color: colors.indigo700,
        primary3Color: colors.grey400,

        accent1Color: colors.pinkA200,
        accent2Color: colors.grey100,
        accent3Color: colors.grey500,

        textColor: colors.darkBlack,
        secondaryTextColor: fade(colors.darkBlack, 0.54),
        alternateTextColor: colors.white,

        canvasColor: colors.white,
        borderColor: colors.grey300,
        disabledColor: fade(colors.darkBlack, 0.3),
        pickerHeaderColor: colors.indigo500,
        clockCircleColor: fade(colors.darkBlack, 0.07),
        shadowColor: colors.fullBlack
    },
    appBar: {
        color: colors.indigo500
    }
};