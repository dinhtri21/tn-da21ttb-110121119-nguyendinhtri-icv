// "use client";
// import { useEffect, useRef, useState } from "react";
// import * as fabric from "fabric";

// export default function DesignPage() {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
//   const [personalInfoGroup, setPersonalInfoGroup] = useState<fabric.Group | null>(null);
//   const [educationGroup, setEducationGroup] = useState<fabric.Group | null>(null);

//   useEffect(() => {
//     if (!canvasRef.current) return;

//     const newCanvas = new fabric.Canvas(canvasRef.current, {
//       height: 600,
//       width: 800,
//       backgroundColor: "#f3f4f6",
//     });

//     const personalInfo = createPersonalInfoGroup(newCanvas);
//     const education = createEducationGroup(newCanvas);

//     setPersonalInfoGroup(personalInfo);
//     setEducationGroup(education);

//     // Lắng nghe sự kiện kéo nhóm thông tin cá nhân
//     personalInfo.on("moving", () => handleDrag(personalInfo, education));
//     personalInfo.on("mouseup", () => handleDrop(personalInfo, education));

//     setCanvas(newCanvas);
//     return () => {
//       newCanvas.dispose();
//     };
//   }, []);

//   // Hàm tạo nhóm thông tin cá nhân
//   const createPersonalInfoGroup = (canvas: fabric.Canvas) => {
//     const labelStyle = { fontSize: 16, fontWeight: "bold" };
//     const inputStyle = { fontSize: 16, backgroundColor: "white" };

//     const fullNameLabel = new fabric.Text("Họ và tên:", { left: 50, top: 50, ...labelStyle });
//     const fullNameInput = new fabric.Textbox("Nguyễn Văn A", { left: 150, top: 50, width: 200, ...inputStyle });

//     const phoneLabel = new fabric.Text("Số điện thoại:", { left: 50, top: 90, ...labelStyle });
//     const phoneInput = new fabric.Textbox("0123456789", { left: 150, top: 90, width: 200, ...inputStyle });

//     const personalInfoGroup = new fabric.Group([fullNameLabel, fullNameInput, phoneLabel, phoneInput], {
//       left: 50,
//       top: 50,
//       selectable: true,
//     });

//     canvas.add(personalInfoGroup);
//     return personalInfoGroup;
//   };

//   // Hàm tạo nhóm học vấn
//   const createEducationGroup = (canvas: fabric.Canvas) => {
//     const labelStyle = { fontSize: 16, fontWeight: "bold" };
//     const inputStyle = { fontSize: 16, backgroundColor: "white" };

//     const schoolLabel = new fabric.Text("Trường học:", { left: 50, top: 170, ...labelStyle });
//     const schoolInput = new fabric.Textbox("Đại học ABC", { left: 150, top: 170, width: 200, ...inputStyle });

//     const majorLabel = new fabric.Text("Ngành:", { left: 50, top: 210, ...labelStyle });
//     const majorInput = new fabric.Textbox("Công nghệ thông tin", { left: 150, top: 210, width: 200, ...inputStyle });

//     const educationGroup = new fabric.Group([schoolLabel, schoolInput, majorLabel, majorInput], {
//       left: 50,
//       top: 170,
//       selectable: false, // Nhóm học vấn không di chuyển được
//     });

//     canvas.add(educationGroup);
//     return educationGroup;
//   };

//   // Hàm xử lý khi kéo nhóm thông tin cá nhân
//   const handleDrag = (personalInfo: fabric.Group, education: fabric.Group) => {
//     const personalTop = personalInfo.top!;
//     const educationTop = education.top!;

//     // Khi nhóm Thông tin cá nhân đi xuống và chạm vào Học vấn
//     if (personalTop >= educationTop - 40) {
//       education.set("top", personalTop - 120);
//       canvas?.renderAll();
//     }
//     // Khi kéo lên lại, học vấn cũng tự động dịch xuống
//     else if (personalTop <= educationTop - 120) {
//       education.set("top", personalTop + 120);
//       canvas?.renderAll();
//     }
//   };

//   // Hàm xử lý khi thả nhóm Thông tin cá nhân
//   const handleDrop = (personalInfo: fabric.Group, education: fabric.Group) => {
//     if (personalInfo.top! >= education.top!) {
//       // Hoán đổi vị trí nếu cần
//       const temp = personalInfo.top;
//       personalInfo.set("top", education.top);
//       education.set("top", temp);
//       canvas?.renderAll();
//     }
//   };

//   return (
//     <div className="flex flex-col items-center p-4">
//       <h1 className="text-xl font-bold mb-4">Demo Drag and Drop CV</h1>
//       <canvas ref={canvasRef} className="border" />
//     </div>
//   );
// }

"use client";
import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";

export default function DragDropCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [groups, setGroups] = useState<fabric.Group[]>([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const newCanvas = new fabric.Canvas(canvasRef.current, {
      width: 400,
      height: 600,
      backgroundColor: "#f3f4f6",
    });

    setCanvas(newCanvas);

    // Tạo các nhóm
    const newGroups = [
      createGroup("Thông tin cá nhân", 50),
      createGroup("Học vấn", 180),
      createGroup("Kinh nghiệm", 310),
    ];

    newGroups.forEach((group) => newCanvas.add(group));
    setGroups(newGroups);

    return () => newCanvas.dispose();
  }, []);

  // Tạo một nhóm draggable
  const createGroup = (title: string, top: number) => {
    const rect = new fabric.Rect({
      width: 300,
      height: 100,
      fill: "white",
      stroke: "black",
      strokeWidth: 2,
      rx: 10,
      ry: 10,
    });

    const text = new fabric.Text(title, {
      fontSize: 18,
      fontWeight: "bold",
      top: 40,
      left: 30,
    });

    const group = new fabric.Group([rect, text], {
      left: 50,
      top,
      hasControls: false,
      lockScalingX: true,
      lockScalingY: true,
    });

    group.on("moving", () => handleDragging(group));
    group.on("mouseup", () => handleDrop(group));

    return group;
  };

  // Xử lý khi di chuyển nhóm
  const handleDragging = (draggedGroup: fabric.Group) => {
    if (!canvas) return;

    // Giữ nhóm trong khung canvas
    if (draggedGroup.top! < 0) {
      draggedGroup.set("top", 0);
    } else if (draggedGroup.top! > canvas.height! - draggedGroup.height!) {
      draggedGroup.set("top", canvas.height! - draggedGroup.height!);
    }

    // Kiểm tra chạm vào nhóm khác và đổi vị trí
    groups.forEach((group) => {
      if (group !== draggedGroup && isOverlapping(draggedGroup, group)) {
        swapGroups(draggedGroup, group);
      }
    });

    canvas.renderAll();
  };

  // Kiểm tra xem 2 nhóm có chạm nhau không
  const isOverlapping = (groupA: fabric.Group, groupB: fabric.Group) => {
    return Math.abs(groupA.top! - groupB.top!) < 50;
  };

  // Đổi vị trí 2 nhóm
  const swapGroups = (groupA: fabric.Group, groupB: fabric.Group) => {
    const tempTop = groupA.top!;
    groupA.set("top", groupB.top);
    groupB.set("top", tempTop);
  };

  // Khi thả ra, giữ lại vị trí hợp lệ
  const handleDrop = (group: fabric.Group) => {
    if (!canvas) return;
    group.set("left", 50);
    canvas.renderAll();
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-lg font-bold mb-4">Drag & Drop trên Canvas</h1>
      <canvas ref={canvasRef} className="border shadow-md" />
    </div>
  );
}