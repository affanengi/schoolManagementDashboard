const SingleStudentPage = ({ params }: { params: { id: string } }) => {
  return (
    <div className="flex-1 p-4 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Student Details ({params.id})</h1>
      <p className="text-gray-500 mt-4">
        This is a placeholder for the single student view. 
        Detailed profile, schedule, and related actions will be implemented in a future phase.
      </p>
    </div>
  );
};

export default SingleStudentPage;
