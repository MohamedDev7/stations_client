import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DismissRegular, SaveRegular } from "@fluentui/react-icons";
import TopBar from "../../components/TopBar/TopBar";
import { Button, Card, Field, Input } from "@fluentui/react-components";
import Row from "../../UI/row/Row";
import { useMutation, useQuery } from "react-query";
import { toast } from "react-toastify";
import { getAllStations } from "../../api/serverApi";
const StoreFormPage = () => {
	//hooks
	const navigate = useNavigate();
	const info = useLocation();
	//states
	const [name, setName] = useState("");
	const [station, setStation] = useState("");
	//queries
	const { data: stations } = useQuery({
		queryKey: ["stations"],
		queryFn: getAllStations,
		select: (res) => {
			return res.data.stations.map((el) => el);
		},
	});
	return <div>StoreFormPage</div>;
};

export default StoreFormPage;
