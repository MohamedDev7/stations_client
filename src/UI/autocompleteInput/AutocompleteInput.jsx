import classes from "./autocompleteInput.module.scss";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import PropTypes from "prop-types";
const AutocompleteInput = ({ label, options, onChange, value, required }) => {
	AutocompleteInput.propTypes = {
		label: PropTypes.any,
		options: PropTypes.any,
		onChange: PropTypes.any,
		value: PropTypes.any,
		emptyMsg: PropTypes.any,
		disableMain: PropTypes.any,
		required: PropTypes.any,
	};

	return (
		<div className={classes.container}>
			<Autocomplete
				options={options}
				getOptionDisabled={(options) => options.disabled}
				value={value}
				onChange={onChange}
				ListboxProps={{
					sx: { fontSize: 16 },
				}}
				sx={{
					"& .MuiAutocomplete-input, & .MuiInputLabel-root": {
						fontSize: 16,
						height: 2,
					},
				}}
				getOptionLabel={(options) => {
					return options.name;
				}}
				renderInput={(params) => (
					<TextField required={required} {...params} label={label} />
				)}
			/>
		</div>
	);
};

export default AutocompleteInput;
