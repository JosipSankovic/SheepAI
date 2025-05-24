import "./LogoutBtn.css";
function LogoutBtn({ onClick }) {
  return (
    <button className="logout-btn" onClick={onClick}>
      <div className="text">Logout</div>
    </button>
  );
}
export default LogoutBtn;
