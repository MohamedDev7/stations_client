import { useContext, useState } from "react";
import { AuthContext } from "../../store/auth-context";
import logo from "../../assets/logo.png";
import { Input, Button, Card } from "@heroui/react";
import AppVersionDisplay from "../../components/appVersionDisplay/AppVersionDisplay";
import UpdateProgressBar from "../../components/updateProgressBar/UpdateProgressBar";

const LoginPage = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [err, setErr] = useState("");
	const { login, updateProgress } = useContext(AuthContext);

	const usernameChangeHandler = (e) => {
		setUsername(e.target.value);
	};
	const passwordChangeHandler = (e) => {
		setPassword(e.target.value);
	};

	const loginHandler = async (e) => {
		try {
			e.preventDefault();
			await login({
				username: username,
				password: password,
			});
		} catch (err) {
			console.log(`err`, err);
			setErr(err.response.data.message);
		}
	};

	return (
		<div className="w-full h-screen flex items-center justify-center">
			<Card>
				<div className="flex w-[600px] h-[400px]">
					<div className="flex-1 p-4 flex flex-col items-center justify-center bg-gradient-to-b from-[rgba(148,0,0,0.3)] via-[rgba(255,255,255,0.3)] to-[rgba(0,0,0,0.3)]">
						<img src={logo} alt="" className="w-full object-contain" />
					</div>
					<form className="flex-1 p-4 flex flex-col" onSubmit={loginHandler}>
						<div className="flex flex-col h-full justify-center gap-5">
							<Input label="أسم المستخدم" onChange={usernameChangeHandler} />
							<Input
								label="كلمة المرور"
								type="password"
								onChange={passwordChangeHandler}
							/>
							{/* <span
							style={{ position: "absolute", bottom: -3, left: 5 }}
							onClick={changePasswordVisibility}
						>
							{passwordIshidden ? <VisibilityIcon /> : <VisibilityOffIcon />}
						</span> */}
							{err && <div>{err}</div>}
							{updateProgress !== null && (
								<div>
									<UpdateProgressBar progress={updateProgress} />
								</div>
							)}
							<Button
								color="primary"
								type="submit"
								disabled={updateProgress !== null}
							>
								دخول
							</Button>
						</div>
						<div className="mt-auto">
							<AppVersionDisplay />
						</div>
					</form>
				</div>
			</Card>
		</div>
	);
};

export default LoginPage;
