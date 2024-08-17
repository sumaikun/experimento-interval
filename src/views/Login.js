import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("persist:root");
  }, []);

  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    age: "",
    email: "",
    university: "",
    logic: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("formData", formData);
    navigate("/introduction", {
      state: { ...formData },
    });
  };

  const isFormComplete = Object.values(formData).every(
    (value) => value.trim() !== ""
  );

  return (
    <div className="form-container">
      <img
        className="logo"
        src="https://www.grupolarabida.org/wp-content/uploads/2020/10/Colombia_UniversidadNacionaldeColombia_UNAL_21_.jpg"
        alt="Universidad Nacional de Colombia"
      />
      <h2 className="title">Registro de Usuario</h2>
      <form className="form" onSubmit={handleSubmit}>
        {[
          { field: "fullName", placeholder: "Nombres y apellidos", icon: "👤" },
          { field: "gender", placeholder: "Sexo", icon: "🚻" },
          { field: "age", placeholder: "Edad", icon: "🎂" },
          { field: "email", placeholder: "Correo electrónico", icon: "📧" },
          { field: "university", placeholder: "Universidad", icon: "🏫" },
          { field: "logic", placeholder: "Lógica", icon: "💡" },
        ].map(({ field, placeholder, icon }) => (
          <div className="input-group" key={field}>
            <span className="icon">{icon}</span>
            {field === "logic" ? (
              <select
                className="input"
                name={field}
                defaultValue=""
                onChange={handleChange}
              >
                <option value="" disabled>
                  {placeholder}
                </option>
                {[...Array(12)]
                  .map((_, index) => index + 1)
                  .map((number) => (
                    <option key={number} value={number}>
                      {number}
                    </option>
                  ))}
              </select>
            ) : (
              <input
                className="input"
                type={field === "email" ? "email" : "text"}
                name={field}
                placeholder={placeholder}
                onChange={handleChange}
              />
            )}
          </div>
        ))}

        <button className="button-login" disabled={!isFormComplete} type="submit">
          Empezar
        </button>
      </form>
    </div>
  );
};

export default Login;
