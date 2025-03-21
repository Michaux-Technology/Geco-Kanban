import * as React from 'react';
import { styled } from '@mui/system';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};

const StyledInputRoot = styled('div')(
  ({ theme }) => `
    font-family: 'IBM Plex Sans', sans-serif;
    font-weight: 400;
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[500]};
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
  `,
);

const StyledInput = styled('input')(
  ({ theme }) => `
    font-size: 0.875rem;
    font-family: inherit;
    font-weight: 400;
    line-height: 1.375;
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    border-radius: 8px;
    margin: 0 8px;
    padding: 10px 12px;
    outline: 0;
    min-width: 0;
    width: 4rem;
    text-align: center;
  `,
);

const StyledButton = styled('button')(
  ({ theme }) => `
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 0.875rem;
    box-sizing: border-box;
    line-height: 1.5;
    border: 1px solid;
    border-radius: 999px;
    width: 32px;
    height: 32px;
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 120ms;

    &:hover {
      background: ${theme.palette.mode === 'dark' ? grey[800] : grey[100]};
    }

    &:focus {
      outline: 2px solid ${theme.palette.mode === 'dark' ? grey[600] : grey[400]};
    }
  `,
);

const NumberInput = React.forwardRef(function CustomNumberInput(props, ref) {
  const { onChange, value, min, max, step = 1, precision = 2, allowDecimals = true, ...other } = props;
  const [displayValue, setDisplayValue] = React.useState(value?.toString() || '0');

  const handleChange = (event) => {
    const newValue = allowDecimals 
      ? event.target.value.replace(/[^0-9,]/g, '')
      : event.target.value.replace(/[^0-9]/g, '');
    setDisplayValue(newValue);
    
    if (newValue) {
      const numericValue = parseFloat(newValue.replace(',', '.'));
      if (!isNaN(numericValue)) {
        onChange?.(event, Math.min(Math.max(numericValue, min || 0), max || Infinity));
      }
    }
  };

  const handleBlur = (event) => {
    const numericValue = parseFloat(displayValue.replace(',', '.')) || 0;
    const clampedValue = Math.min(Math.max(numericValue, min || 0), max || Infinity);
    const formattedValue = allowDecimals 
      ? clampedValue.toFixed(precision).replace('.', ',')
      : Math.round(clampedValue).toString();
    setDisplayValue(formattedValue);
    onChange?.(event, allowDecimals ? clampedValue : Math.round(clampedValue));
  };

  const increment = () => {
    const currentValue = parseFloat(displayValue.replace(',', '.')) || 0;
    const newValue = Math.min(currentValue + (step || 1), max || Infinity);
    const formattedValue = allowDecimals 
      ? newValue.toFixed(precision).replace('.', ',')
      : Math.round(newValue).toString();
    setDisplayValue(formattedValue);
    onChange?.(null, allowDecimals ? newValue : Math.round(newValue));
  };

  const decrement = () => {
    const currentValue = parseFloat(displayValue.replace(',', '.')) || 0;
    const newValue = Math.max(currentValue - (step || 1), min || 0);
    const formattedValue = allowDecimals 
      ? newValue.toFixed(precision).replace('.', ',')
      : Math.round(newValue).toString();
    setDisplayValue(formattedValue);
    onChange?.(null, allowDecimals ? newValue : Math.round(newValue));
  };

  React.useEffect(() => {
    if (value !== undefined) {
      const formattedValue = allowDecimals 
        ? value.toFixed(precision).replace('.', ',')
        : Math.round(value).toString();
      setDisplayValue(formattedValue);
    }
  }, [value, precision, allowDecimals]);

  return (
    <StyledInputRoot>
      <StyledButton type="button" onClick={decrement}>
        <RemoveIcon fontSize="small" />
      </StyledButton>
      <StyledInput
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        {...other}
      />
      <StyledButton type="button" onClick={increment}>
        <AddIcon fontSize="small" />
      </StyledButton>
    </StyledInputRoot>
  );
});

export default NumberInput;
