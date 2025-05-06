interface IProps {
  steps: string[];
  currentStep: number;
}

export const OnboardingStepper = ({ steps, currentStep }: IProps) => {
  return (
    <div className="flex items-center justify-center space-x-4">
      {steps.map((label, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`px-4 py-1 text-sm font-medium transition-all duration-300
              ${
                index === currentStep
                  ? "border border-[#82a5ff] rounded-[7px] text-[#e9eeff] bg-[#10121a80]"
                  : "text-gray-500"
              }

              ${index < currentStep ? "text-[#82a5ff]!" : "text-gray-500"}
            `}
          >
            {label}
          </div>

          {index < steps.length - 1 && (
            <div
              className={`w-8 h-px mx-2 transition-all duration-300 
                ${index < currentStep ? "bg-[#82a5ff]" : "bg-gray-300"}
              `}
            />
          )}
        </div>
      ))}
    </div>
  );
};
