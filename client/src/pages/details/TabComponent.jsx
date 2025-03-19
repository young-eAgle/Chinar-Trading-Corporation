import React, { useState } from "react";
import {
  Card,
  CardContent,
  Tabs,
  Tab,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Rating,
  TextField,
  Button,
  Avatar,
} from "@mui/material";
import { motion } from "framer-motion";

const tabs = [
  { id: "description", label: "Description" },
  { id: "reviews", label: "Reviews" },
  { id: "specs", label: "Specifications" },
];

const initialReviews = [
  { name: "John Doe", comment: "Great product! Highly recommended.", rating: 5, date: "May 1, 2021", avatar: "https://i.pravatar.cc/40?img=1" },
  { name: "Jane Smith", comment: "Decent quality but could be better.", rating: 3, date: "June 15, 2021", avatar: "https://i.pravatar.cc/40?img=2" },
  { name: "Alice Brown", comment: "Amazing value for the price!", rating: 4, date: "July 20, 2021", avatar: "https://i.pravatar.cc/40?img=3" },
];

const specifications = [
  { key: "Brand", value: "XYZ Electronics" },
  { key: "Model", value: "X-2000" },
  { key: "Battery Life", value: "10 hours" },
  { key: "Weight", value: "1.2 kg" },
];

export default function TabComponent() {
  const [activeTab, setActiveTab] = useState("description");
  const [reviews, setReviews] = useState(initialReviews);
  const [newReview, setNewReview] = useState({ name: "", email: "", comment: "", rating: 0 });

  const handleReviewSubmit = () => {
    if (newReview.name && newReview.comment && newReview.rating > 0) {
      const newReviewEntry = {
        name: newReview.name,
        comment: newReview.comment,
        rating: newReview.rating,
        date: new Date().toLocaleDateString(),
        avatar: `https://i.pravatar.cc/40?img=${Math.floor(Math.random() * 10) + 1}`,
      };
      setReviews([newReviewEntry, ...reviews]);
      setNewReview({ name: "", email: "", comment: "", rating: 0 });
    }
  };

  return (
    <Box className="w-full max-w-3xl mx-auto p-4">
      <Card elevation={3} className="p-4">
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          {tabs.map((tab) => (
            <Tab key={tab.id} label={tab.label} value={tab.id} />
          ))}
        </Tabs>
      </Card>
      <Card className="mt-6 p-4 shadow-lg">
        <CardContent>
          {activeTab === "description" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Typography variant="h5" className="mb-4 font-semibold">Product Overview</Typography>
              <Typography variant="body1" className="text-gray-700 leading-relaxed">
                Experience the latest in cutting-edge technology with this premium electronic device.
                Designed for seamless performance, it provides efficiency, reliability, and an exceptional user experience.
                Whether you need it for work, entertainment, or everyday tasks, this product delivers unmatched versatility.
              </Typography>
            </motion.div>
          )}

          {activeTab === "reviews" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Typography variant="h5" className="mb-4 font-semibold">Customer Reviews</Typography>
              {reviews.map((review, index) => (
                <Box key={index} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 flex items-start gap-4">
                  <Avatar src={review.avatar} alt={review.name} />
                  <Box>
                    <Typography variant="subtitle1" className="font-medium">{review.name}</Typography>
                    <Typography variant="caption" className="text-gray-500">{review.date}</Typography>
                    <Rating value={review.rating} precision={0.5} readOnly className="mb-1" />
                    <Typography variant="body2" className="text-gray-700">{review.comment}</Typography>
                  </Box>
                </Box>
              ))}
              <Box className="mt-6 p-4 border-t">
                <Typography variant="h6" className="mb-2 font-semibold">Add a Review</Typography>
                <Rating
                  precision={0.5}
                  className="mb-2"
                  value={newReview.rating}
                  onChange={(e, newValue) => setNewReview({ ...newReview, rating: newValue })}
                />
                <TextField
                  label="Your Review"
                  multiline
                  rows={4}
                  variant="outlined"
                  fullWidth
                  className="mb-2"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                />
                <TextField
                  label="Name"
                  variant="outlined"
                  fullWidth
                  className="mb-2"
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                />
                <TextField
                  label="Email"
                  type="email"
                  variant="outlined"
                  fullWidth
                  className="mb-2"
                  value={newReview.email}
                  onChange={(e) => setNewReview({ ...newReview, email: e.target.value })}
                />
                <Button variant="contained" color="primary" onClick={handleReviewSubmit}>Submit</Button>
              </Box>
            </motion.div>
          )}

          {activeTab === "specs" && (
            <TableContainer component={Paper} className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><b>Feature</b></TableCell>
                    <TableCell><b>Details</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {specifications.map((spec, index) => (
                    <TableRow key={index}>
                      <TableCell>{spec.key}</TableCell>
                      <TableCell>{spec.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
