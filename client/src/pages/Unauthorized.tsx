function Unauthorized() {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-gray-100 to-gray-300">
      <div className="bg-white p-10 rounded-2xl shadow-2xl flex flex-col items-center">
        <img
          src="/Stop.jpg"
          alt="Unauthorized"
          className="w-40 h-40 object-contain mb-6"
        />
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
        <p className="text-gray-600 text-center max-w-md">
          You do not have permission to view this page. Please check your
          credentials or contact the administrator if you believe this is an
          error.
        </p>
      </div>
    </div>
  );
}

export default Unauthorized;
